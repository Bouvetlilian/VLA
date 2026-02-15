// app/admin/vehicles/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Liste des véhicules - Back office admin
// Tableau avec filtres, recherche, pagination et actions (modifier, dupliquer, supprimer)
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatKilometrage, translateStatus, getStatusBadgeClass } from "@/lib/utils/format";

type Vehicle = {
  id: number;
  slug: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  prix: number;
  carburant: string;
  status: string;
  featured: boolean;
  images: Array<{ url: string; isMain: boolean }>;
};

type Filters = {
  status: string;
  marque: string;
  search: string;
};

export default function VehiclesListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    marque: "all",
    search: "",
  });

  // Charger les véhicules
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.status !== "all") params.append("status", filters.status);
        if (filters.marque !== "all") params.append("marque", filters.marque);
        if (filters.search) params.append("search", filters.search);

        const response = await fetch(`/api/admin/vehicles?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setVehicles(data.vehicles || []);
        } else {
          console.error("Erreur:", data.error);
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [filters]);

  // Supprimer un véhicule
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/vehicles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setVehicles((prev) => prev.filter((v) => v.id !== id));
        alert("Véhicule supprimé avec succès");
      } else {
        const data = await response.json();
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
      console.error(error);
    }
  };

  // Extraire les marques uniques pour le filtre
  const uniqueMarques = Array.from(new Set(vehicles.map((v) => v.marque))).sort();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-3xl text-vla-black mb-2">
            Gestion des véhicules
          </h1>
          <p className="text-gray-500 font-semibold">
            {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""} au total
          </p>
        </div>

        <Link
          href="/admin/vehicles/new"
          className="px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un véhicule
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Marque, modèle..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none transition-colors"
            />
          </div>

          {/* Filtre statut */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none transition-colors"
            >
              <option value="all">Tous les statuts</option>
              <option value="PUBLISHED">Publié</option>
              <option value="DRAFT">Brouillon</option>
              <option value="SOLD">Vendu</option>
              <option value="RESERVED">Réservé</option>
            </select>
          </div>

          {/* Filtre marque */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Marque
            </label>
            <select
              value={filters.marque}
              onChange={(e) => setFilters({ ...filters, marque: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none transition-colors"
            >
              <option value="all">Toutes les marques</option>
              {uniqueMarques.map((marque) => (
                <option key={marque} value={marque}>
                  {marque}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bouton reset */}
        {(filters.status !== "all" || filters.marque !== "all" || filters.search) && (
          <button
            onClick={() => setFilters({ status: "all", marque: "all", search: "" })}
            className="mt-4 text-sm font-bold text-gray-500 hover:text-vla-orange transition-colors"
          >
            ✕ Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Tableau des véhicules */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-vla-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">Chargement...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 font-semibold mb-4">
              Aucun véhicule trouvé
            </p>
            <Link
              href="/admin/vehicles/new"
              className="text-sm font-bold text-vla-orange hover:underline"
            >
              Créer votre première annonce →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-gray-500">
                    Véhicule
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-gray-500">
                    Année
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-gray-500">
                    Prix
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-gray-500">
                    Km
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-gray-500">
                    Statut
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-black uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
                  const mainImage = vehicle.images.find((img) => img.isMain) || vehicle.images[0];
                  
                  return (
                    <tr key={vehicle.id} className="border-t border-gray-100 hover:bg-vla-beige/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {/* Image */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {mainImage ? (
                              <Image
                                src={mainImage.url}
                                alt={`${vehicle.marque} ${vehicle.modele}`}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div>
                            <p className="font-bold text-vla-black">
                              {vehicle.marque} {vehicle.modele}
                            </p>
                            <p className="text-sm text-gray-500">
                              {vehicle.carburant}
                              {vehicle.featured && (
                                <span className="ml-2 text-vla-orange">★ Featured</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-gray-700">
                        {vehicle.annee}
                      </td>

                      <td className="py-4 px-6 font-bold text-vla-orange">
                        {formatPrice(vehicle.prix)}
                      </td>

                      <td className="py-4 px-6 text-gray-600">
                        {formatKilometrage(vehicle.kilometrage)}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(vehicle.status)}`}>
                          {translateStatus(vehicle.status)}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          {/* Bouton modifier */}
                          <Link
                            href={`/admin/vehicles/${vehicle.id}/edit`}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Modifier"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>

                          {/* Bouton supprimer */}
                          <button
                            onClick={() => handleDelete(vehicle.id, `${vehicle.marque} ${vehicle.modele}`)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
