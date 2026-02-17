"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface VehicleForm {
  marque: string;
  modele: string;
  version: string;
  annee: string;
  kilometrage: string;
  carburant: string;
  boite: string;
  couleur: string;
  nbPortes: string;
  puissance: string;
  etat: string;
  carnet: string;
  accident: string;
  options: string[];
  commentaire: string;
}

interface MarketAnalysis {
  marche: {
    prixMin: number;
    prixMax: number;
    prixMedian: number;
    nbAnnonces: string;
    tendance: "stable" | "baisse" | "hausse";
    liquidite: "forte" | "normale" | "faible";
    sources: string[];
    resume: string;
  };
  rachat: {
    prixMin: number;
    prixMax: number;
    prixConseille: number;
    margeEstimee: string;
    fraisRemiseEnEtat: number;
    explication: string;
  };
  vigilance: {
    mecanique: string[];
    carrosserie: string[];
    administratif: string[];
    marche: string[];
    specifiques: string[];
  };
  synthese: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Données statiques
// ─────────────────────────────────────────────────────────────────────────────

const MARQUES = [
  "Abarth", "Alfa Romeo", "Audi", "BMW", "Citroën", "Cupra", "DS",
  "Fiat", "Ford", "Honda", "Hyundai", "Jeep", "Kia", "Land Rover",
  "Lexus", "Mazda", "Mercedes", "Mini", "Mitsubishi", "Nissan",
  "Opel", "Peugeot", "Porsche", "Renault", "Seat", "Skoda",
  "Smart", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

const OPTIONS_LIST = [
  "GPS / Navigation",
  "Toit ouvrant / Panoramique",
  "Caméra de recul",
  "Régulateur de vitesse adaptatif",
  "Sièges chauffants",
  "Sièges en cuir",
  "Jantes alliage",
  "Pack sport",
  "Climatisation automatique",
  "Aide au stationnement",
  "Système audio premium",
  "Phares LED / Matrix",
  "Vitres teintées",
  "Attelage",
  "Toit ouvrant électrique",
];

const ANNEES = Array.from({ length: 20 }, (_, i) => (2025 - i).toString());

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function TendanceIcon({ tendance }: { tendance: "stable" | "baisse" | "hausse" }) {
  if (tendance === "hausse") {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 font-bold text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Hausse
      </span>
    );
  }
  if (tendance === "baisse") {
    return (
      <span className="inline-flex items-center gap-1 text-red-500 font-bold text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        Baisse
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-gray-500 font-bold text-sm">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
      </svg>
      Stable
    </span>
  );
}

function LiquiditeBadge({ liquidite }: { liquidite: "forte" | "normale" | "faible" }) {
  const config = {
    forte: { bg: "bg-green-100", text: "text-green-700", label: "Liquidité forte" },
    normale: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Liquidité normale" },
    faible: { bg: "bg-red-100", text: "text-red-700", label: "Liquidité faible" },
  };
  const c = config[liquidite];
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────

export default function RachatPage() {
  const [form, setForm] = useState<VehicleForm>({
    marque: "",
    modele: "",
    version: "",
    annee: "",
    kilometrage: "",
    carburant: "",
    boite: "",
    couleur: "",
    nbPortes: "",
    puissance: "",
    etat: "",
    carnet: "",
    accident: "",
    options: [],
    commentaire: "",
  });

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOptionToggle = (option: string) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.includes(option)
        ? prev.options.filter((o) => o !== option)
        : [...prev.options, option],
    }));
  };

  const handleRadio = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.marque || !form.modele || !form.annee || !form.kilometrage || !form.carburant || !form.boite) {
      setError("Veuillez remplir au minimum : marque, modèle, année, kilométrage, carburant et boîte.");
      return;
    }
    setError(null);
    setLoading(true);
    setAnalysis(null);

    try {
      const res = await fetch("/api/admin/rachat/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          kilometrage: parseInt(form.kilometrage.replace(/\s/g, ""), 10),
          annee: parseInt(form.annee, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      // Mapping de la structure retournée par la route vers l'interface MarketAnalysis
      const raw = data.data;
      const mapped: MarketAnalysis = {
        marche: {
          prixMin: raw.marcheObserve?.prixMin ?? 0,
          prixMax: raw.marcheObserve?.prixMax ?? 0,
          prixMedian: raw.marcheObserve?.prixMedian ?? 0,
          nbAnnonces: String(raw.marcheObserve?.nombreAnnonces ?? 0),
          tendance: raw.marcheObserve?.tendance ?? "stable",
          liquidite: raw.marcheObserve?.liquidite === "elevee" ? "forte" : (raw.marcheObserve?.liquidite ?? "normale"),
          sources: raw.marcheObserve?.sources ?? [],
          resume: raw.marcheObserve?.commentaireSourcing ?? "",
        },
        rachat: {
          prixMin: raw.recommandationRachat?.prixRachatMin ?? 0,
          prixMax: raw.recommandationRachat?.prixRachatMax ?? 0,
          prixConseille: raw.recommandationRachat?.prixConseille ?? 0,
          margeEstimee: String(raw.recommandationRachat?.margeEstimee ?? 0),
          fraisRemiseEnEtat: raw.recommandationRachat?.fraisRemiseEnEtat ?? 0,
          explication: raw.recommandationRachat?.detailCalcul ?? "",
        },
        vigilance: {
          mecanique: raw.pointsVigilance?.mecanique ?? [],
          carrosserie: raw.pointsVigilance?.carrosserie ?? [],
          administratif: raw.pointsVigilance?.administratif ?? [],
          marche: raw.pointsVigilance?.marche ?? [],
          specifiques: raw.pointsVigilance?.specifiques ?? [],
        },
        synthese: raw.synthese ?? "",
      };
      setAnalysis(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-vla-beige">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-vla-orange rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-black text-2xl text-vla-black">Outil de cotation rachat</h1>
              <p className="text-sm text-gray-500 font-semibold">Analyse de marché & recommandation de prix</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        {!analysis && (
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="font-black text-lg text-vla-black mb-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-vla-orange text-white rounded-full text-xs flex items-center justify-center font-black">1</span>
              Caractéristiques du véhicule
            </h2>

            {/* Ligne 1 : Marque / Modèle / Version */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Marque <span className="text-vla-orange">*</span>
                </label>
                <select
                  name="marque"
                  value={form.marque}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-vla-black focus:outline-none focus:ring-2 focus:ring-vla-orange focus:border-transparent transition-all"
                >
                  <option value="">Sélectionner</option>
                  {MARQUES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Modèle <span className="text-vla-orange">*</span>
                </label>
                <input
                  type="text"
                  name="modele"
                  value={form.modele}
                  onChange={handleChange}
                  placeholder="ex : 308, Golf, Clio..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-vla-black focus:outline-none focus:ring-2 focus:ring-vla-orange focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Version / Finition
                </label>
                <input
                  type="text"
                  name="version"
                  value={form.version}
                  onChange={handleChange}
                  placeholder="ex : 1.5 BlueHDi 130 GT"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-vla-black focus:outline-none focus:ring-2 focus:ring-vla-orange focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Ligne 2 : Année / Km / Puissance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Année <span className="text-vla-orange">*</span>
                </label>
                <select
                  name="annee"
                  value={form.annee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-vla-black focus:outline-none focus:ring-2 focus:ring-vla-orange focus:border-transparent transition-all"
                >
                  <option value="">Sélectionner</option>
                  {ANNEES.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Kilométrage <span className="text-vla-orange">*</span>
                </label>
                <input
                  type="text"
                  name="kilometrage"
                  value={form.kilometrage}
                  onChange={handleChange}
                  placeholder="ex : 87 500"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-vla-black focus:outline-none focus:ring-2 focus:ring-vla-orange focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Puissance (ch)
                </label>
                <input
                  type="number"
                  name="puissance"
                  value={form.puissance}
                  onChange={handleChange}
                  placeholder="ex : 130"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-vla-black focus:outline-none focus:ring-2 focus:ring-vla-orange focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Ligne 3 : Carburant / Boîte / Portes / Couleur */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Carburant <span className="text-vla-orange">*</span>
                </label>
                <select
                  name="carburant"
                  value={form.carburant}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-vla-black focus:outline-none focus:ring-2 focus:ring-vla-orange focus:border-transparent transition-all"
                >
                  <option value="">Sélectionner</option>
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybride">Hybride</option>
                  <option value="Hybride rechargeable">Hybride rechargeable</option>
                  <option value="Électrique">Électrique</option>
                  <option value="GPL">GPL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Boîte <span className="text-vla-orange">*</span>
                </label>
                <select
                  name="boite"
                  value={form.boite}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-vla-black focus:outline-none focus:ring-2 focus:ring-vla-orange focus:border-transparent transition-all"
                >
                  <option value="">Sélectionner</option>
                  <option value="Manuelle">Manuelle</option>
                  <option value="Automatique">Automatique</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Nb de portes
                </label>
                <select
                  name="nbPortes"
                  value={form.nbPortes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-vla-black focus:outline-none focus:ring-2 focus:ring-vla-orange focus:border-transparent transition-all"
                >
                  <option value="">—</option>
                  <option value="2">2 portes</option>
                  <option value="3">3 portes</option>
                  <option value="4">4 portes</option>
                  <option value="5">5 portes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Couleur
                </label>
                <input
                  type="text"
                  name="couleur"
                  value={form.couleur}
                  onChange={handleChange}
                  placeholder="ex : Noir, Blanc..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-vla-black focus:outline-none focus:ring-2 focus:ring-vla-orange focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Séparateur */}
            <hr className="border-gray-100 mb-6" />

            <h2 className="font-black text-lg text-vla-black mb-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-vla-orange text-white rounded-full text-xs flex items-center justify-center font-black">2</span>
              État & historique
            </h2>

            {/* État général */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                État général du véhicule
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: "Excellent", icon: "⭐", desc: "Comme neuf" },
                  { value: "Bon", icon: "👍", desc: "Bon état général" },
                  { value: "Correct", icon: "⚠️", desc: "Quelques défauts" },
                  { value: "À rénover", icon: "🔧", desc: "Nécessite travaux" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleRadio("etat", item.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.etat === item.value
                        ? "border-vla-orange bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-lg mb-1">{item.icon}</div>
                    <div className="font-bold text-sm text-vla-black">{item.value}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Carnet */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Carnet d&apos;entretien
              </label>
              <div className="flex flex-wrap gap-3">
                {["Complet", "Incomplet", "Absent", "Non applicable"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleRadio("carnet", val)}
                    className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                      form.carnet === val
                        ? "border-vla-orange bg-orange-50 text-vla-orange"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Accident */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Historique d&apos;accident
              </label>
              <div className="flex flex-wrap gap-3">
                {["Aucun accident", "Accident(s) réparé(s)", "Je ne sais pas"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleRadio("accident", val)}
                    className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                      form.accident === val
                        ? "border-vla-orange bg-orange-50 text-vla-orange"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Séparateur */}
            <hr className="border-gray-100 mb-6" />

            <h2 className="font-black text-lg text-vla-black mb-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-vla-orange text-white rounded-full text-xs flex items-center justify-center font-black">3</span>
              Options & commentaires
            </h2>

            {/* Options */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Options déclarées (sélectionner toutes celles présentes)
              </label>
              <div className="flex flex-wrap gap-2">
                {OPTIONS_LIST.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOptionToggle(option)}
                    className={`px-3 py-1.5 rounded-lg border font-semibold text-xs transition-all ${
                      form.options.includes(option)
                        ? "border-vla-orange bg-orange-50 text-vla-orange"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {form.options.includes(option) ? "✓ " : ""}{option}
                  </button>
                ))}
              </div>
            </div>

            {/* Commentaire */}
            <div className="mb-8">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Observations du commercial / du vendeur
              </label>
              <textarea
                name="commentaire"
                value={form.commentaire}
                onChange={handleChange}
                rows={3}
                placeholder="Défauts visibles, informations importantes, impression générale..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 font-semibold text-sm text-vla-black focus:outline-none focus:ring-2 focus:ring-vla-orange focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-vla-orange text-white font-black text-base rounded-2xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyse en cours... (30-60 secondes)
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.5 3.5 0 00-1.035 2.45V21a2 2 0 01-4 0v-.586a3.5 3.5 0 00-1.035-2.45L6.343 15.9z" />
                  </svg>
                  Analyser le marché avec l&apos;IA
                </>
              )}
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mt-6 bg-white rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-vla-orange animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="font-black text-vla-black mb-2">Recherche en cours...</p>
            <p className="text-sm text-gray-500 font-semibold">
              L&apos;IA scanne les annonces similaires sur LeBonCoin, La Centrale, AutoScout24...
            </p>
          </div>
        )}

        {/* Résultats */}
        {analysis && !loading && (
          <div className="space-y-6">

            {/* Synthèse */}
            <div className="bg-vla-orange rounded-3xl p-6 text-white">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.5 3.5 0 00-1.035 2.45V21a2 2 0 01-4 0v-.586a3.5 3.5 0 00-1.035-2.45L6.343 15.9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-black text-lg mb-1">Synthèse de l&apos;analyse</p>
                  <p className="text-white text-opacity-90 text-sm font-semibold leading-relaxed">{analysis.synthese}</p>
                </div>
              </div>
            </div>

            {/* Grille : Marché + Rachat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Marché */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="font-black text-vla-black text-base mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-vla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  État du marché
                </h3>

                {/* Prix médian (gros) */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Prix médian marché</p>
                  <p className="font-black text-3xl text-vla-black">{formatPrice(analysis.marche.prixMedian)}</p>
                </div>

                {/* Fourchette */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase">Bas du marché</p>
                    <p className="font-black text-lg text-vla-black">{formatPrice(analysis.marche.prixMin)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase">Haut du marché</p>
                    <p className="font-black text-lg text-vla-black">{formatPrice(analysis.marche.prixMax)}</p>
                  </div>
                </div>

                {/* Indicateurs */}
                <div className="flex items-center justify-between mb-4">
                  <TendanceIcon tendance={analysis.marche.tendance} />
                  <LiquiditeBadge liquidite={analysis.marche.liquidite} />
                </div>

                <p className="text-xs text-gray-400 font-semibold mb-2">
                  Annonces observées : <span className="text-vla-black">{analysis.marche.nbAnnonces}</span>
                </p>

                <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-3">{analysis.marche.resume}</p>

                {analysis.marche.sources?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {analysis.marche.sources.map((src) => (
                      <span key={src} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rachat */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="font-black text-vla-black text-base mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-vla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recommandation de rachat
                </h3>

                {/* Prix conseillé */}
                <div className="bg-orange-50 border-2 border-vla-orange rounded-2xl p-4 mb-4 text-center">
                  <p className="text-xs font-bold text-vla-orange uppercase tracking-wide mb-1">Prix de rachat conseillé</p>
                  <p className="font-black text-4xl text-vla-orange">{formatPrice(analysis.rachat.prixConseille)}</p>
                </div>

                {/* Fourchette rachat */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase">Offre mini</p>
                    <p className="font-black text-lg text-vla-black">{formatPrice(analysis.rachat.prixMin)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase">Offre maxi</p>
                    <p className="font-black text-lg text-vla-black">{formatPrice(analysis.rachat.prixMax)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Marge estimée</p>
                    <p className="font-bold text-sm text-green-600">{analysis.rachat.margeEstimee}</p>
                  </div>
                  {analysis.rachat.fraisRemiseEnEtat > 0 && (
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase">Frais remise en état</p>
                      <p className="font-bold text-sm text-red-500">~{formatPrice(analysis.rachat.fraisRemiseEnEtat)}</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 font-semibold leading-relaxed">{analysis.rachat.explication}</p>
              </div>
            </div>

            {/* Points de vigilance */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h3 className="font-black text-vla-black text-base mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-vla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Points de vigilance avant rachat
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    key: "mecanique",
                    label: "Mécanique",
                    items: analysis.vigilance.mecanique,
                    color: "red",
                    icon: "🔧",
                  },
                  {
                    key: "carrosserie",
                    label: "Carrosserie",
                    items: analysis.vigilance.carrosserie,
                    color: "orange",
                    icon: "🚘",
                  },
                  {
                    key: "administratif",
                    label: "Administratif",
                    items: analysis.vigilance.administratif,
                    color: "blue",
                    icon: "📋",
                  },
                  {
                    key: "marche",
                    label: "Marché / Revente",
                    items: analysis.vigilance.marche,
                    color: "purple",
                    icon: "📊",
                  },
                  {
                    key: "specifiques",
                    label: "Spécifiques à ce modèle",
                    items: analysis.vigilance.specifiques,
                    color: "yellow",
                    icon: "⚡",
                  },
                ]
                  .filter((cat) => cat.items?.length > 0)
                  .map((cat) => (
                    <div
                      key={cat.key}
                      className="bg-gray-50 rounded-2xl p-4"
                    >
                      <p className="font-black text-sm text-vla-black mb-3 flex items-center gap-2">
                        <span>{cat.icon}</span>
                        {cat.label}
                      </p>
                      <ul className="space-y-2">
                        {cat.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-vla-orange flex-shrink-0 mt-1.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-4 bg-white text-vla-black font-black text-sm rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                ← Nouvelle analyse
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-4 bg-vla-black text-white font-black text-sm rounded-2xl hover:bg-opacity-80 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}