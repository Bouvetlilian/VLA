"use client";

import { useState, useMemo, useEffect } from "react";
import VehicleCard from "@/components/VehicleCard";
import { fetchVehicles } from "@/lib/utils/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type Vehicle = {
  id: number;
  slug: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  prix: number;
  carburant: string;
  boite: string;
  badge: string | null;
  featured: boolean;
  images: Array<{ url: string; alt: string | null }>;
};

// ─── Constantes locales (options de filtres) ──────────────────────────────────

const CARBURANTS = ["Tous", "Essence", "Diesel", "Hybride", "Hybride rechargeable", "Électrique", "GPL"];
const BOITES = ["Toutes", "Manuelle", "Automatique"];
const KM_MAX_OPTIONS = [
  { label: "Pas de limite", value: 999999 },
  { label: "< 10 000 km", value: 10000 },
  { label: "< 30 000 km", value: 30000 },
  { label: "< 50 000 km", value: 50000 },
  { label: "< 100 000 km", value: 100000 },
];
const PRIX_MAX = 50000;

// ─── Composant Select stylisé ─────────────────────────────────────────────────

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black uppercase tracking-widest text-vla-orange">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border-2 border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-vla-black cursor-pointer outline-none focus:border-vla-orange transition-all duration-200 pr-10"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M1 1L7 7L13 1" stroke="#FF8633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AcheterPage() {
  // États pour les véhicules
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [marque, setMarque] = useState("Toutes");
  const [modele, setModele] = useState("Tous");
  const [annee, setAnnee] = useState("Toutes");
  const [carburant, setCarburant] = useState("Tous");
  const [boite, setBoite] = useState("Toutes");
  const [kmMax, setKmMax] = useState(999999);
  const [prixMax, setPrixMax] = useState(PRIX_MAX);

  // Charger les véhicules au montage
  useEffect(() => {
    async function loadVehicles() {
      setLoading(true);
      setError(null);

      const result = await fetchVehicles({
        marque: marque !== "Toutes" ? marque : undefined,
        modele: modele !== "Tous" ? modele : undefined,
        annee: annee !== "Toutes" ? annee : undefined,
        carburant: carburant !== "Tous" ? carburant : undefined,
        boite: boite !== "Toutes" ? boite : undefined,
        kmMax: kmMax !== 999999 ? kmMax : undefined,
        prixMax: prixMax !== PRIX_MAX ? prixMax : undefined,
      });

      if (result.success) {
        setVehicles(result.data.vehicles);
      } else {
        setError(result.error);
      }

      setLoading(false);
    }

    loadVehicles();
  }, [marque, modele, annee, carburant, boite, kmMax, prixMax]);

  // Calculer les options disponibles depuis les véhicules
  const marques = useMemo(() => {
    const uniqueMarques = Array.from(new Set(vehicles.map((v) => v.marque))).sort();
    return ["Toutes", ...uniqueMarques];
  }, [vehicles]);

  const modeles = useMemo(() => {
    if (marque === "Toutes") return ["Tous"];
    const filtered = vehicles.filter((v) => v.marque === marque);
    const uniqueModeles = Array.from(new Set(filtered.map((v) => v.modele))).sort();
    return ["Tous", ...uniqueModeles];
  }, [vehicles, marque]);

  const annees = useMemo(() => {
    const uniqueAnnees = Array.from(new Set(vehicles.map((v) => String(v.annee)))).sort(
      (a, b) => Number(b) - Number(a)
    );
    return ["Toutes", ...uniqueAnnees];
  }, [vehicles]);

  // Quand on change de marque, on reset le modèle
  const handleMarqueChange = (v: string) => {
    setMarque(v);
    setModele("Tous");
  };

  const resetFilters = () => {
    setMarque("Toutes");
    setModele("Tous");
    setAnnee("Toutes");
    setCarburant("Tous");
    setBoite("Toutes");
    setKmMax(999999);
    setPrixMax(PRIX_MAX);
  };

  const hasActiveFilters =
    marque !== "Toutes" ||
    annee !== "Toutes" ||
    carburant !== "Tous" ||
    boite !== "Toutes" ||
    kmMax !== 999999 ||
    prixMax !== PRIX_MAX;

  return (
    <div className="min-h-screen bg-vla-beige">
      {/* Hero compact */}
      <div className="px-6 md:px-12 pt-10 pb-2 max-w-7xl mx-auto">
        <h1 className="font-black text-4xl md:text-6xl text-vla-black leading-tight mb-2">
          Trouvez votre<br />
          <span className="text-vla-orange">véhicule idéal</span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 font-semibold">
          {loading ? "Chargement..." : `${vehicles.length} véhicule${vehicles.length > 1 ? "s" : ""} disponible${vehicles.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Bloc filtres */}
      <div className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: "white",
            boxShadow: "0 4px 40px rgba(0,0,0,0.07)",
          }}
        >
          {/* Grille de selects */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Select label="Marque" value={marque} options={marques} onChange={handleMarqueChange} />
            <Select label="Modèle" value={modele} options={modeles} onChange={setModele} />
            <Select label="Année" value={annee} options={annees} onChange={setAnnee} />
            <Select label="Carburant" value={carburant} options={CARBURANTS} onChange={setCarburant} />
            <Select label="Boîte" value={boite} options={BOITES} onChange={setBoite} />
            <Select
              label="Kilométrage max"
              value={String(kmMax)}
              options={KM_MAX_OPTIONS.map((o) => String(o.value))}
              onChange={(v) => setKmMax(Number(v))}
            />
          </div>

          {/* Slider prix */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-widest text-vla-orange">
                Budget maximum
              </label>
              <span className="text-sm font-black text-vla-black">
                {prixMax === PRIX_MAX ? "Pas de limite" : `${prixMax.toLocaleString("fr-FR")} €`}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={5000}
                max={PRIX_MAX}
                step={500}
                value={prixMax}
                onChange={(e) => setPrixMax(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #FF8633 0%, #FF8633 ${((prixMax - 5000) / (PRIX_MAX - 5000)) * 100}%, #e5e7eb ${((prixMax - 5000) / (PRIX_MAX - 5000)) * 100}%, #e5e7eb 100%)`,
                  accentColor: "#FF8633",
                }}
              />
              <style>{`
                input[type=range]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #FF8633;
                  cursor: pointer;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(255,134,51,0.4);
                }
                input[type=range]::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #FF8633;
                  cursor: pointer;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(255,134,51,0.4);
                }
              `}</style>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400 font-semibold">5 000 €</span>
              <span className="text-xs text-gray-400 font-semibold">{PRIX_MAX.toLocaleString("fr-FR")} €</span>
            </div>
          </div>

          {/* Footer filtres */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <p className="text-sm font-bold text-gray-400">
              {loading ? (
                "Chargement..."
              ) : (
                <>
                  <span className="text-vla-black font-black">{vehicles.length}</span>{" "}
                  {vehicles.length > 1 ? "véhicules trouvés" : "véhicule trouvé"}
                </>
              )}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-sm font-bold text-gray-400 hover:text-vla-orange transition-colors flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grille annonces */}
      <div className="px-6 md:px-12 pb-20 max-w-7xl mx-auto">
        {error ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="font-black text-2xl text-vla-black mb-2">Erreur de chargement</h3>
            <p className="text-gray-400 font-semibold mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-vla-orange text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all"
            >
              Réessayer
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-24">
            <div className="animate-spin w-12 h-12 border-4 border-vla-orange border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400 font-semibold">Chargement des véhicules...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-black text-2xl text-vla-black mb-2">Aucun véhicule trouvé</h3>
            <p className="text-gray-400 font-semibold mb-6">Essayez d&apos;élargir vos critères de recherche</p>
            <button
              onClick={resetFilters}
              className="bg-vla-orange text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all"
            >
              Voir tous les véhicules
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
