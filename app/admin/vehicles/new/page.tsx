// app/admin/vehicles/new/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Création d'un nouveau véhicule - Back office admin
// Formulaire complet avec tous les champs + upload d'images (à venir)
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, FormEvent } from "react";
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

export default function NewVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<FormData>({
    marque: "",
    modele: "",
    annee: new Date().getFullYear().toString(),
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Préparer les données
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

      const response = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Véhicule créé avec succès !");
        router.push("/admin/vehicles");
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
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
          Ajouter un véhicule
        </h1>
        <p className="text-gray-500 font-semibold">
          Remplissez le formulaire pour créer une nouvelle annonce
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Erreur globale */}
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
                placeholder="BMW, Peugeot..."
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
                placeholder="Série 3, 308..."
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
                placeholder="320d xDrive Sport..."
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
                placeholder="45000"
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
                placeholder="25000"
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
                placeholder="184 ch"
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
                placeholder="Blanc, Noir..."
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
                placeholder="Décrivez le véhicule en détail..."
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
                placeholder="GPS, Caméra de recul, Sièges chauffants..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Exemple : GPS, Caméra de recul, Sièges chauffants
              </p>
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
                placeholder="Nouveau, Coup de cœur..."
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

        {/* Note : Upload d'images sera ajouté à l'étape 6 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-700">
            ℹ️ L'upload d'images sera disponible après l'intégration de Cloudinary (Étape 6)
          </p>
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
            disabled={loading}
            className="px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Création..." : "Créer le véhicule"}
          </button>
        </div>
      </form>
    </div>
  );
}
