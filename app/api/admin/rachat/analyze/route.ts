import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Extrait le premier bloc JSON valide trouvé dans un texte
function extractJSON(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  const start = text.indexOf("{");
  if (start === -1) throw new SyntaxError("Aucun JSON trouvé dans la réponse");

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") depth--;
    if (depth === 0) return text.slice(start, i + 1);
  }

  throw new SyntaxError("JSON incomplet dans la réponse");
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const {
      marque,
      modele,
      annee,
      kilometrage,
      carburant,
      boite,
      version,
      couleur,
      nbPortes,
      puissance,
      etat,
      carnet,
      accident,
      commentaire,
      options,
    } = body;

    if (!marque || !modele || !annee || !kilometrage || !carburant || !boite) {
      return NextResponse.json(
        { error: "Données véhicule incomplètes" },
        { status: 400 },
      );
    }

    const systemPrompt = `Tu es un expert en évaluation automobile pour un mandataire automobile professionnel (VL Automobiles, basé à Nantes).

INSTRUCTION ABSOLUE : Tu dois répondre UNIQUEMENT avec un objet JSON valide. Aucun texte avant, aucun texte après, aucune explication, aucune introduction. Juste le JSON brut.

Ton rôle :
1. Rechercher des annonces similaires sur LeBonCoin, La Centrale, AutoScout24, Largus pour analyser les prix du marché
2. Calculer une recommandation de prix de rachat favorable à la marge
3. Lister des points de vigilance avant rachat

Règles métier pour le prix de rachat :
- Marge brute cible : 15% à 25% du prix de revente estimé
- Décotes cumulables : kilométrage > 100 000 km (-5%), accident déclaré (-8%), carnet incomplet (-3%), état Correct (-5%), état À rénover (-15%), liquidité faible (-5%)
- Intégrer les frais de remise en état dans le calcul
- Toujours proposer prixMin, prixMax et prixConseille

Structure JSON OBLIGATOIRE (respecter exactement les types) :
{
  "marche": {
    "prixMin": 0,
    "prixMax": 0,
    "prixMedian": 0,
    "nbAnnonces": "string",
    "tendance": "stable",
    "liquidite": "normale",
    "sources": ["string"],
    "resume": "string"
  },
  "rachat": {
    "prixMin": 0,
    "prixMax": 0,
    "prixConseille": 0,
    "margeEstimee": "string",
    "fraisRemiseEnEtat": 0,
    "explication": "string"
  },
  "vigilance": {
    "mecanique": ["string"],
    "carrosserie": ["string"],
    "administratif": ["string"],
    "marche": ["string"],
    "specifiques": ["string"]
  },
  "synthese": "string"
}

Valeurs autorisées : tendance = "stable"|"baisse"|"hausse" / liquidite = "forte"|"normale"|"faible"
Tous les prix sont des entiers en euros (pas de décimales, pas de symbole €).`;

    const userMessage = `Recherche des annonces similaires puis analyse ce véhicule pour un rachat. Réponds uniquement en JSON.

VÉHICULE
- Marque : ${marque}
- Modèle : ${modele}
- Version / Finition : ${version || "Non précisée"}
- Année : ${annee}
- Kilométrage : ${Number(kilometrage).toLocaleString("fr-FR")} km
- Carburant : ${carburant}
- Boîte : ${boite}
- Couleur : ${couleur || "Non précisée"}
- Nombre de portes : ${nbPortes || "Non précisé"}
- Puissance : ${puissance ? puissance + " ch" : "Non précisée"}

ÉTAT DU VÉHICULE
- État général : ${etat || "Non précisé"}
- Carnet d'entretien : ${carnet || "Non précisé"}
- Historique accident : ${accident || "Non précisé"}
- Options : ${options?.length > 0 ? options.join(", ") : "Aucune"}
- Observations : ${commentaire || "Aucune"}`;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: systemPrompt,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3,
        } as unknown as Anthropic.Tool,
      ],
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const textContent = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("");

    console.log(
      "[API RACHAT] Réponse brute Claude :",
      textContent.slice(0, 300),
    );

    const jsonString = extractJSON(textContent);
    const analysis = JSON.parse(jsonString);

    // ── Sauvegarde en base de données ─────────────────────────────────────────
    try {
      await prisma.rachatEstimation.create({
        data: {
          // Véhicule
          marque,
          modele,
          version: version || null,
          annee: Number(annee),
          kilometrage: Number(kilometrage),
          carburant,
          boite,
          couleur: couleur || null,
          puissance: puissance ? `${puissance} ch` : null,
          // État
          etat: etat || null,
          carnet: carnet || null,
          accident: accident || null,
          options: options || [],
          commentaire: commentaire || null,
          // Résultats marché
          marchePrixMin: analysis.marche.prixMin,
          marchePrixMax: analysis.marche.prixMax,
          marchePrixMedian: analysis.marche.prixMedian,
          marcheTendance: analysis.marche.tendance,
          marcheLiquidite: analysis.marche.liquidite,
          marcheResume: analysis.marche.resume,
          // Recommandation rachat
          rachatPrixMin: analysis.rachat.prixMin,
          rachatPrixMax: analysis.rachat.prixMax,
          rachatPrixConseille: analysis.rachat.prixConseille,
          rachatMargeEstimee: analysis.rachat.margeEstimee,
          rachatFraisRemiseEnEtat: analysis.rachat.fraisRemiseEnEtat,
          rachatExplication: analysis.rachat.explication,
          // Vigilance
          vigilance: analysis.vigilance,
          // Synthèse
          synthese: analysis.synthese,
          // Admin
          adminId: (session as { user?: { id?: string } })?.user?.id || null,
          adminName:
            (session as { user?: { name?: string } })?.user?.name || null,
        },
      });
      console.log("[API RACHAT] Estimation sauvegardée en BDD");
    } catch (dbError) {
      // On ne bloque pas la réponse si la sauvegarde échoue
      console.error(
        "[API RACHAT] Erreur sauvegarde BDD (non bloquant):",
        dbError,
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("[API RACHAT] Erreur analyse:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Erreur de parsing de la réponse IA" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de l'analyse du marché" },
      { status: 500 },
    );
  }
}
