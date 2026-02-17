// app/api/admin/rachat/analyze/route.ts
// v3 — Scraping pré-traité côté serveur + Sonnet 4.5 raisonnement uniquement
// web_search supprimé → coût ~0.05-0.10$ par analyse au lieu de 87$

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scrapeAutoScout24 } from "@/lib/scrapers/autoscout";
import { scrapeLaCentrale } from "@/lib/scrapers/lacentrale";
import type { AnnonceScrappee } from "@/lib/scrapers/autoscout";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── Extraction JSON robuste ─────────────────────────────────────────────────
function extractJSON(text: string): string {
  const startIdx = text.indexOf("{");
  const endIdx = text.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return text.substring(startIdx, endIdx + 1);
  }
  throw new Error("Aucun bloc JSON trouvé dans la réponse IA");
}

// ─── Formatage des annonces pour le prompt ───────────────────────────────────
// Transforme les annonces brutes en texte compact — minimise les tokens input
function formatAnnoncesForPrompt(annonces: AnnonceScrappee[]): string {
  if (annonces.length === 0)
    return "Aucune annonce disponible pour cette source.";

  return annonces
    .map((a, i) => {
      const km =
        a.kilometrage > 0
          ? `${a.kilometrage.toLocaleString("fr-FR")} km`
          : "km inconnu";
      const annee = a.annee > 0 ? String(a.annee) : "année inconnue";
      const vendeur = a.typVendeur === "professionnel" ? "PRO" : "PAR";
      const version = a.version ? ` — ${a.version.substring(0, 40)}` : "";
      return `  ${i + 1}. ${a.prix.toLocaleString("fr-FR")}€ | ${annee} | ${km} | ${vendeur}${version}`;
    })
    .join("\n");
}

// ─── System Prompt ───────────────────────────────────────────────────────────
// Le modèle NE cherche PAS sur le web — il raisonne uniquement sur les données fournies
const SYSTEM_PROMPT = `Tu es un expert en valorisation de véhicules d'occasion pour un mandataire automobile professionnel (Nantes, Pays de la Loire).

Tu reçois des données de marché réelles collectées en temps réel sur La Centrale et AutoScout24.
Tu n'as PAS accès au web — tu travailles UNIQUEMENT avec les données fournies.

==============================================================
  RÔLE ET CONTEXTE MÉTIER
==============================================================
Le mandataire rachète des véhicules à des particuliers pour les revendre
avec une marge. Ton rôle est d'estimer :
1. Le prix de revente réaliste du véhicule (ce que le mandataire peut obtenir)
2. Le prix de rachat maximum conseillé (pour préserver la marge)

==============================================================
  ANALYSE DES DONNÉES DE MARCHÉ
==============================================================
À partir des annonces fournies :

1. DISTINCTION obligatoire :
   - PAR = particulier (prix souvent 5-10% plus haut, négociation courante)
   - PRO = professionnel (prix de marché réel, plus fiable)
   Pondérer les prix PRO avec un coefficient 1.0, les PAR avec 0.92

2. CALCUL du prix médian pondéré :
   - Exclure les outliers (prix < Q1 - 1.5×IQR ou > Q3 + 1.5×IQR)
   - Calculer la médiane sur les prix restants

3. PRIX DE REVENTE ESTIMÉ = prix médian pondéré PRO
   Si < 3 annonces PRO disponibles, utiliser 95% du médian général

==============================================================
  CALCUL DU PRIX DE RACHAT CONSEILLÉ
==============================================================
Partir du prix de revente estimé, appliquer dans cet ordre :

ÉTAPE 1 — Marge brute cible : ×0.80 (20% de marge)
ÉTAPE 2 — Soustraire frais remise en état estimés
ÉTAPE 3 — Décotes état :
  Excellent : ×1.00 | Bon : ×0.98 | Correct : ×0.95 | À rénover : ×0.85
ÉTAPE 4 — Décotes cumulables :
  km > 100 000 : ×0.95
  km > 150 000 : ×0.92 (remplace la précédente)
  Accident déclaré : ×0.92
  Carnet incomplet : ×0.97
  Liquidité faible : ×0.95
ÉTAPE 5 — Arrondir au 100€ inférieur

Fourchette : min = prixConseille - 500€, max = prixConseille + 300€

==============================================================
  ESTIMATION DES FRAIS DE REMISE EN ÉTAT
==============================================================
Estimer selon l'état déclaré :
  Excellent  : 300-500€ (révision + préparation)
  Bon        : 500-900€ (révision + petits travaux)
  Correct    : 900-1800€ (travaux visibles + révision)
  À rénover  : 1800-4000€ (carrosserie + mécanique)

Ajuster si observations spécifiques mentionnées.

==============================================================
  FORMAT DE SORTIE — JSON STRICT
==============================================================
INSTRUCTION ABSOLUE : Répondre UNIQUEMENT avec le JSON ci-dessous.
Aucun texte avant, aucun texte après, aucun backtick markdown.

{
  "marcheObserve": {
    "prixMin": 0,
    "prixMax": 0,
    "prixMedian": 0,
    "prixRevente": 0,
    "nombreAnnonces": 0,
    "nombreAnnoncesProf": 0,
    "tendance": "stable",
    "liquidite": "normale",
    "sources": [],
    "commentaireSourcing": ""
  },
  "recommandationRachat": {
    "prixConseille": 0,
    "prixRachatMin": 0,
    "prixRachatMax": 0,
    "margeEstimee": 0,
    "margePercent": 0,
    "fraisRemiseEnEtat": 0,
    "detailCalcul": "",
    "argumentaire": ""
  },
  "pointsVigilance": {
    "mecanique": [],
    "carrosserie": [],
    "administratif": [],
    "marche": [],
    "specifiques": []
  },
  "synthese": "",
  "qualiteDonnees": "bonne"
}

Champs :
- tendance       : "hausse" | "stable" | "baisse"
- liquidite      : "elevee" | "normale" | "faible"
- detailCalcul   : description étape par étape du calcul appliqué
- argumentaire   : 2-3 phrases pour justifier le prix au vendeur
- qualiteDonnees : "bonne" | "limitee" | "insuffisante" selon nb annonces`;

// ─── Handler POST ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await req.json();
    const {
      marque,
      modele,
      annee,
      kilometrage,
      carburant,
      boite,
      etat,
      carnetEntretien,
      historiqueAccident,
      options,
      observations,
    } = body;

    if (!marque || !modele || !annee || !kilometrage) {
      return NextResponse.json(
        {
          error:
            "Champs obligatoires manquants : marque, modèle, année, kilométrage",
        },
        { status: 400 },
      );
    }

    const anneeInt = parseInt(annee);
    const kmInt = parseInt(kilometrage);

    // ── ÉTAPE 1 : Collecte parallèle des deux sources ─────────────────────────
    console.log(
      `[Rachat] Collecte marché pour ${marque} ${modele} ${annee} ${kmInt}km`,
    );

    const [annoncesAutoScout, annoncesLaCentrale] = await Promise.allSettled([
      scrapeAutoScout24({
        marque,
        modele,
        annee: anneeInt,
        kilometrage: kmInt,
      }),
      scrapeLaCentrale({ marque, modele, annee: anneeInt, kilometrage: kmInt }),
    ]);

    const autoScoutData: AnnonceScrappee[] =
      annoncesAutoScout.status === "fulfilled" ? annoncesAutoScout.value : [];
    const laCentraleData: AnnonceScrappee[] =
      annoncesLaCentrale.status === "fulfilled" ? annoncesLaCentrale.value : [];

    const totalAnnonces = autoScoutData.length + laCentraleData.length;

    console.log(
      `[Rachat] AutoScout24: ${autoScoutData.length} annonces | La Centrale: ${laCentraleData.length} annonces`,
    );

    // ── ÉTAPE 2 : Construction du prompt avec données structurées ─────────────
    const sourcesDisponibles: string[] = [];
    if (autoScoutData.length > 0) sourcesDisponibles.push("AutoScout24");
    if (laCentraleData.length > 0) sourcesDisponibles.push("La Centrale");

    const userPrompt = `Analyse ce véhicule et donne une recommandation de rachat basée sur les données de marché ci-dessous.

═══════════════════════════════════════
VÉHICULE À ANALYSER
═══════════════════════════════════════
Marque / Modèle  : ${marque} ${modele}
Année            : ${anneeInt}
Kilométrage      : ${kmInt.toLocaleString("fr-FR")} km
Carburant        : ${carburant || "Non précisé"}
Boîte            : ${boite || "Non précisée"}
État général     : ${etat || "Non précisé"}
Carnet entretien : ${carnetEntretien || "Non précisé"}
Historique accid.: ${historiqueAccident || "Non précisé"}
Options/Équip.   : ${options || "Non précisé"}
Observations     : ${observations || "Aucune"}

═══════════════════════════════════════
DONNÉES DE MARCHÉ — AutoScout24 (${autoScoutData.length} annonces)
═══════════════════════════════════════
${formatAnnoncesForPrompt(autoScoutData)}

═══════════════════════════════════════
DONNÉES DE MARCHÉ — La Centrale (${laCentraleData.length} annonces)
═══════════════════════════════════════
${formatAnnoncesForPrompt(laCentraleData)}

═══════════════════════════════════════
CONTEXTE
═══════════════════════════════════════
Total annonces disponibles : ${totalAnnonces}
Sources actives            : ${sourcesDisponibles.join(", ") || "Aucune"}
${totalAnnonces < 5 ? '⚠️ Données limitées — préciser "qualiteDonnees": "limitee" dans la réponse' : ""}
${totalAnnonces === 0 ? '⚠️ Aucune donnée collectée — baser l\'analyse sur ta connaissance du marché et préciser "qualiteDonnees": "insuffisante"' : ""}

Retourne uniquement le JSON de recommandation.`;

    // ── ÉTAPE 3 : Appel Sonnet SANS web_search ────────────────────────────────
    // Pas de tools = pas de web_search = coût maîtrisé
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048, // Limité — le JSON de sortie n'a pas besoin de plus
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extraction texte
    const textContent = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as Anthropic.TextBlock).text)
      .join("\n");

    if (!textContent.trim()) {
      throw new Error("La réponse de l'IA est vide");
    }

    // Parsing JSON
    let analysisData;
    try {
      const jsonStr = extractJSON(textContent);
      analysisData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Erreur parsing JSON IA:", parseError);
      console.error("Réponse brute:", textContent.substring(0, 500));
      throw new Error("Impossible de parser la réponse de l'IA. Réessayez.");
    }

    // ── ÉTAPE 4 : Sauvegarde BDD ──────────────────────────────────────────────
    const estimation = await prisma.rachatEstimation.create({
      data: {
        // Véhicule
        marque,
        modele,
        annee: anneeInt,
        kilometrage: kmInt,
        carburant: carburant || null,
        boite: boite || null,
        etat: etat || null,
        carnet: carnetEntretien || null,
        accident: historiqueAccident || null,
        options: options || null,
        commentaire: observations || null,

        // Marché — Int selon schéma
        marchePrixMin: parseInt(analysisData.marcheObserve?.prixMin || 0),
        marchePrixMax: parseInt(analysisData.marcheObserve?.prixMax || 0),
        marchePrixMedian: parseInt(analysisData.marcheObserve?.prixMedian || 0),
        marcheTendance: String(analysisData.marcheObserve?.tendance || "stable"),
        marcheLiquidite: String(analysisData.marcheObserve?.liquidite || "normale"),
        marcheResume: String(analysisData.marcheObserve?.commentaireSourcing || ""),

        // Rachat — Int sauf rachatMargeEstimee qui est String selon schéma
        rachatPrixConseille: parseInt(analysisData.recommandationRachat?.prixConseille || 0),
        rachatPrixMin: parseInt(analysisData.recommandationRachat?.prixRachatMin || 0),
        rachatPrixMax: parseInt(analysisData.recommandationRachat?.prixRachatMax || 0),
        rachatMargeEstimee: String(analysisData.recommandationRachat?.margeEstimee || 0),
        rachatFraisRemiseEnEtat: parseInt(analysisData.recommandationRachat?.fraisRemiseEnEtat || 0),
        rachatExplication:
          String(analysisData.recommandationRachat?.detailCalcul || ""),
        vigilance: analysisData.pointsVigilance || {},
        synthese: analysisData.synthese || "",

        // Admin
        adminId: session.user.id,
        adminName: session.user.name || "Admin",
      },
    });

    // Log coût estimé (informatif)
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;
    const coutEstime = (inputTokens * 3 + outputTokens * 15) / 1_000_000;
    console.log(
      `[Rachat] Tokens: ${inputTokens} input / ${outputTokens} output — coût estimé: $${coutEstime.toFixed(4)}`,
    );

    return NextResponse.json({
      success: true,
      estimationId: estimation.id,
      data: analysisData,
      meta: {
        annoncesCollectees: totalAnnonces,
        sources: sourcesDisponibles,
        coutEstime: `$${coutEstime.toFixed(4)}`,
      },
    });
  } catch (error) {
    console.error("Erreur analyse rachat:", error);

    if (error instanceof Error && error.message.includes("401")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}