// ─── Types ────────────────────────────────────────────────────────────────────
// Source unique de vérité pour le type Vehicle.
// À terme, ce fichier sera remplacé par des appels API.

export type Vehicle = {
  id: number;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  prix: number;
  carburant: "Essence" | "Diesel" | "Hybride" | "Électrique";
  boite: "Manuelle" | "Automatique";
  images: string[]; // tableau — première image = image principale
  badge?: string;
  // Détails supplémentaires pour la page détail
  puissance?: string;
  couleur?: string;
  portes?: number;
  places?: number;
  description?: string;
  options?: string[];
};

// ─── Données mock ─────────────────────────────────────────────────────────────
// Remplacer par un fetch API quand le backend sera disponible.

export const VEHICLES: Vehicle[] = [
  {
    id: 1,
    marque: "Peugeot",
    modele: "308",
    annee: 2023,
    kilometrage: 18000,
    prix: 22900,
    carburant: "Essence",
    boite: "Automatique",
    images: ["/images/hero-bg.jpg", "/images/cta-bg.jpg", "/images/hero-bg.jpg"],
    badge: "Coup de cœur",
    puissance: "130 ch",
    couleur: "Blanc Nacré",
    portes: 5,
    places: 5,
    description:
      "Magnifique Peugeot 308 de 2023 en excellent état. Premier propriétaire, carnet d'entretien complet à jour. Véhicule non fumeur, toujours garé en box. Révision récente effectuée. Idéale pour un usage quotidien comme pour les longs trajets.",
    options: [
      "Caméra de recul",
      "Régulateur de vitesse adaptatif",
      "Sièges chauffants",
      "Apple CarPlay / Android Auto",
      "Toit panoramique",
      "Jantes alliage 18\"",
    ],
  },
  {
    id: 2,
    marque: "Renault",
    modele: "Scénic",
    annee: 2022,
    kilometrage: 34500,
    prix: 19500,
    carburant: "Diesel",
    boite: "Manuelle",
    images: ["/images/cta-bg.jpg", "/images/hero-bg.jpg"],
    puissance: "115 ch",
    couleur: "Gris Cassiopée",
    portes: 5,
    places: 5,
    description:
      "Renault Scénic diesel économique, parfait pour les grandes familles. Entretien rigoureux, aucun accident. Pneus neufs posés en 2024.",
    options: [
      "GPS intégré",
      "Aide au stationnement",
      "Bluetooth",
      "Climatisation automatique",
    ],
  },
  {
    id: 3,
    marque: "Toyota",
    modele: "Yaris",
    annee: 2024,
    kilometrage: 4200,
    prix: 26400,
    carburant: "Hybride",
    boite: "Automatique",
    images: ["/images/hero-bg.jpg", "/images/cta-bg.jpg"],
    badge: "Nouveau",
    puissance: "116 ch",
    couleur: "Rouge Intense",
    portes: 5,
    places: 5,
    description:
      "Toyota Yaris hybride quasi-neuve. Consommation mixte annoncée à 3,8L/100km. Garantie constructeur encore active jusqu'en 2027. Idéale pour la ville.",
    options: [
      "Écran tactile 9\"",
      "Chargeur sans fil",
      "Système Toyota Safety Sense",
      "Climatisation automatique bi-zone",
      "Jantes alliage",
    ],
  },
  {
    id: 4,
    marque: "Ford",
    modele: "Kuga",
    annee: 2023,
    kilometrage: 22000,
    prix: 31900,
    carburant: "Hybride",
    boite: "Automatique",
    images: ["/images/cta-bg.jpg", "/images/hero-bg.jpg", "/images/cta-bg.jpg"],
    puissance: "190 ch",
    couleur: "Bleu Métallisé",
    portes: 5,
    places: 5,
    description:
      "Ford Kuga PHEV en excellent état. Autonomie électrique d'environ 50km. Parfait pour les trajets domicile-travail sans consommer de carburant.",
    options: [
      "Toit panoramique",
      "Sièges en cuir",
      "Caméra 360°",
      "Hayon électrique",
      "Chargeur rapide AC 7.4kW",
    ],
  },
  {
    id: 5,
    marque: "Volkswagen",
    modele: "Golf",
    annee: 2021,
    kilometrage: 51000,
    prix: 17800,
    carburant: "Essence",
    boite: "Manuelle",
    images: ["/images/hero-bg.jpg", "/images/cta-bg.jpg"],
    puissance: "110 ch",
    couleur: "Noir Profond",
    portes: 5,
    places: 5,
    description:
      "Golf 8 bien équipée, entretien VW exclusivement. Véhicule sain, aucune reprise à prévoir. Idéale pour les conducteurs recherchant fiabilité et plaisir de conduite.",
    options: [
      "Digital Cockpit Pro",
      "We Connect Plus",
      "Climatisation automatique",
      "Aide au maintien de voie",
    ],
  },
  {
    id: 6,
    marque: "BMW",
    modele: "Série 3",
    annee: 2022,
    kilometrage: 38000,
    prix: 38500,
    carburant: "Diesel",
    boite: "Automatique",
    images: ["/images/cta-bg.jpg", "/images/hero-bg.jpg", "/images/cta-bg.jpg"],
    badge: "Premium",
    puissance: "190 ch",
    couleur: "Blanc Alpina",
    portes: 4,
    places: 5,
    description:
      "BMW Série 3 330d xDrive, le summum du segment berline premium. Finition Sport Line, sellerie cuir Dakota. Historique d'entretien BMW complet.",
    options: [
      "Pack M Sport",
      "Sièges sport cuir",
      "Harman Kardon",
      "Head-up display",
      "Toit ouvrant électrique",
      "Pack parking",
      "Jantes M 19\"",
    ],
  },
  {
    id: 7,
    marque: "Citroën",
    modele: "C5 X",
    annee: 2023,
    kilometrage: 14000,
    prix: 28900,
    carburant: "Hybride",
    boite: "Automatique",
    images: ["/images/hero-bg.jpg", "/images/cta-bg.jpg"],
    puissance: "180 ch",
    couleur: "Gris Platinium",
    portes: 5,
    places: 5,
    description:
      "Citroën C5 X hybride rechargeable, le confort à la française. Suspensions hydrauliques progressives, habitacle ultra-silencieux. Parfaitement entretenu.",
    options: [
      "Suspension Advanced Comfort",
      "Sièges massants",
      "Écran 12\"",
      "Chargeur induction",
      "Caméra 360°",
    ],
  },
  {
    id: 8,
    marque: "Tesla",
    modele: "Model 3",
    annee: 2023,
    kilometrage: 9800,
    prix: 42000,
    carburant: "Électrique",
    boite: "Automatique",
    images: ["/images/cta-bg.jpg", "/images/hero-bg.jpg", "/images/cta-bg.jpg"],
    badge: "Nouveau",
    puissance: "358 ch",
    couleur: "Rouge Multi-Couches",
    portes: 4,
    places: 5,
    description:
      "Tesla Model 3 Performance quasi-neuve. 0 à 100 km/h en 3,3s. Autonomie WLTP 547km. Superchargeur gratuit pendant 1 an inclus. Autopilot complet activé.",
    options: [
      "Autopilot complet",
      "Toit vitré panoramique",
      "Jantes Überturbine 20\"",
      "Pack Performance",
      "Son Premium",
    ],
  },
  {
    id: 9,
    marque: "Renault",
    modele: "Clio",
    annee: 2021,
    kilometrage: 62000,
    prix: 13900,
    carburant: "Essence",
    boite: "Manuelle",
    images: ["/images/hero-bg.jpg", "/images/cta-bg.jpg"],
    puissance: "90 ch",
    couleur: "Orange Valencia",
    portes: 5,
    places: 5,
    description:
      "Renault Clio 5 essence, idéale comme première voiture ou véhicule de ville. Entretien complet à jour, pneus en bon état. Aucun défaut mécanique.",
    options: [
      "Écran multimédia 9.3\"",
      "Climatisation automatique",
      "Caméra de recul",
      "Bluetooth mains-libres",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getVehicleById(id: number): Vehicle | null {
  return VEHICLES.find((v) => v.id === id) ?? null;
}

export function getPrevNextVehicles(id: number): {
  prev: Vehicle | null;
  next: Vehicle | null;
} {
  const index = VEHICLES.findIndex((v) => v.id === id);
  return {
    prev: index > 0 ? VEHICLES[index - 1] : null,
    next: index < VEHICLES.length - 1 ? VEHICLES[index + 1] : null,
  };
}

// ─── Options pour les filtres (page /acheter) ─────────────────────────────────

export const MARQUES_OPTIONS = [
  "Toutes",
  ...Array.from(new Set(VEHICLES.map((v) => v.marque))).sort(),
];

export const MODELES_MAP = VEHICLES.reduce<Record<string, string[]>>((acc, v) => {
  if (!acc[v.marque]) acc[v.marque] = [];
  if (!acc[v.marque].includes(v.modele)) acc[v.marque].push(v.modele);
  return acc;
}, {});

export const ANNEES_OPTIONS = [
  "Toutes",
  ...Array.from(new Set(VEHICLES.map((v) => String(v.annee)))).sort(
    (a, b) => Number(b) - Number(a)
  ),
];

export const PRIX_MAX = 50000;