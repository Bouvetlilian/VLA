// app/admin/vehicles/[id]/edit/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modification d'un véhicule existant - Back office admin
// Formulaire pré-rempli avec les données actuelles
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FormData = {
  marque: string;
  modele: string;
  annee: string;
  version: string;
  kilometrage: string;
  prix: string;
  carburant: string;
  boite: string;
  puissance: string;
  couleur: string;
  portes: string;
  places: string;
  description: string;
  options: string;
  status: string;
  badge: string;
  featured: boolean;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditVehiclePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    marque: "",
    modele: "",
    annee: "",
    version: "",
    kilometrage: "",
    prix: "",
    carburant: "ESSENCE",
    boite: "MANUELLE",
    puissance: "",
    couleur: "",
    portes: "5",
    places: "5",
    description: "",
    options: "",
    status: "DRAFT",
    badge: "",
    featured: false,
  });

  // Charger les données du véhicule
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/admin/vehicles/${vehicleId}`);
        const data = await response.json();

        if (response.ok) {
          const vehicle = data.vehicle;
          setFormData({
            marque: vehicle.marque,
            modele: vehicle.modele,
            annee: vehicle.annee.toString(),
            version: vehicle.version || "",
            kilometrage: vehicle.kilometrage.toString(),
            prix: vehicle.prix.toString(),
            carburant: vehicle.carburant,
            boite: vehicle.boite,
            puissance: vehicle.puissance,
            couleur: vehicle.couleur,
            portes: vehicle.portes.toString(),
            places: vehicle.places.toString(),
            description: vehicle.description,
            options: vehicle.options.join(", "),
            status: vehicle.status,
            badge: vehicle.badge || "",
            featured: vehicle.featured,
          });
        } else {
          setError("Véhicule introuvable");
        }
      } catch (err) {
        setError("Erreur lors du chargement");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        ...formData,
        annee: parseInt(formData.annee),
        kilometrage: parseInt(formData.kilometrage),
        prix: parseInt(formData.prix),
        portes: parseInt(formData.portes),
        places: parseInt(formData.places),
        options: formData.options
          .split(",")
          .map((opt) => opt.trim())
          .filter(Boolean),
        badge: formData.badge || null,
        version: formData.version || null,
      };

      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Véhicule modifié avec succès !");
        router.push("/admin/vehicles");
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="w-12 h-12 border-4 border-vla-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">Chargement du véhicule...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.marque) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-12 text-center">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <Link
            href="/admin/vehicles"
            className="text-sm font-bold text-vla-orange hover:underline"
          >
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/vehicles"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-vla-orange mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour à la liste
        </Link>

        <h1 className="font-black text-3xl text-vla-black mb-2">
          Modifier le véhicule
        </h1>
        <p className="text-gray-500 font-semibold">
          {formData.marque} {formData.modele} - {formData.annee}
        </p>
      </div>

      {/* Formulaire (identique à la création) */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        {/* Section 1 : Informations générales */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Informations générales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Marque *
              </label>
              <input
                type="text"
                name="marque"
                value={formData.marque}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Modèle *
              </label>
              <input
                type="text"
                name="modele"
                value={formData.modele}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Année *
              </label>
              <input
                type="number"
                name="annee"
                value={formData.annee}
                onChange={handleChange}
                required
                min="1990"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Version
              </label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Kilométrage *
              </label>
              <input
                type="number"
                name="kilometrage"
                value={formData.kilometrage}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2 : Caractéristiques techniques */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Caractéristiques techniques
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Carburant *
              </label>
              <select
                name="carburant"
                value={formData.carburant}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              >
                <option value="ESSENCE">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRIDE">Hybride</option>
                <option value="HYBRIDE_RECHARGEABLE">Hybride rechargeable</option>
                <option value="ELECTRIQUE">Électrique</option>
                <option value="GPL">GPL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Boîte de vitesses *
              </label>
              <select
                name="boite"
                value={formData.boite}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              >
                <option value="MANUELLE">Manuelle</option>
                <option value="AUTOMATIQUE">Automatique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Puissance *
              </label>
              <input
                type="text"
                name="puissance"
                value={formData.puissance}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Couleur *
              </label>
              <input
                type="text"
                name="couleur"
                value={formData.couleur}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre de portes *
              </label>
              <select
                name="portes"
                value={formData.portes}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              >
                <option value="3">3 portes</option>
                <option value="5">5 portes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre de places *
              </label>
              <select
                name="places"
                value={formData.places}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              >
                <option value="2">2 places</option>
                <option value="4">4 places</option>
                <option value="5">5 places</option>
                <option value="7">7 places</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3 : Description et options */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Description et équipements
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description complète *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Options (séparées par des virgules)
              </label>
              <textarea
                name="options"
                value={formData.options}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4 : Publication */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Publication
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Statut *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="RESERVED">Réservé</option>
                <option value="SOLD">Vendu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Badge (optionnel)
              </label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-vla-orange focus:ring-vla-orange"
                />
                <span className="text-sm font-bold text-gray-700">
                  Mettre en avant sur la page d'accueil
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/vehicles"
            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
