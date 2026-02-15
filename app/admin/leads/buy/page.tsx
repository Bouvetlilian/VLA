// app/admin/leads/buy/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Liste des demandes d'achat (leads buy) - Back office admin
// Tableau avec filtres, stats et actions
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatRelativeDate, translateStatus, getStatusBadgeClass, formatPhone } from "@/lib/utils/format";

type BuyLead = {
  id: string;
  prenom: string;
  telephone: string;
  message: string | null;
  status: string;
  createdAt: string;
  vehicle: {
    id: number;
    marque: string;
    modele: string;
    annee: number;
  };
};

type Stats = {
  total: number;
  new: number;
  inProgress: number;
  treated: number;
};

export default function BuyLeadsPage() {
  const [leads, setLeads] = useState<BuyLead[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, new: 0, inProgress: 0, treated: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Charger les leads
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.append("status", statusFilter);

        const response = await fetch(`/api/admin/leads/buy?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setLeads(data.leads || []);
          setStats(data.stats || { total: 0, new: 0, inProgress: 0, treated: 0 });
        } else {
          console.error("Erreur:", data.error);
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [statusFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/admin/leads/buy"
            className="text-sm font-bold text-vla-orange"
          >
            Demandes d'achat
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            href="/admin/leads/sell"
            className="text-sm font-semibold text-gray-500 hover:text-vla-orange"
          >
            Demandes de vente
          </Link>
        </div>

        <h1 className="font-black text-3xl text-vla-black mb-2">
          Demandes d'achat
        </h1>
        <p className="text-gray-500 font-semibold">
          Gestion des prospects intéressés par l'achat d'un véhicule
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <p className="text-xs font-black uppercase text-gray-400 mb-1">Total</p>
          <p className="text-2xl font-black text-vla-black">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <p className="text-xs font-black uppercase text-gray-400 mb-1">Nouveaux</p>
          <p className="text-2xl font-black text-orange-500">{stats.new}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <p className="text-xs font-black uppercase text-gray-400 mb-1">En cours</p>
          <p className="text-2xl font-black text-blue-500">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <p className="text-xs font-black uppercase text-gray-400 mb-1">Traités</p>
          <p className="text-2xl font-black text-green-500">{stats.treated}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-4">
          <label className="text-sm font-bold text-gray-700">
            Statut :
          </label>
          <div className="flex gap-2">
            {["all", "NEW", "IN_PROGRESS", "TREATED", "ARCHIVED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  statusFilter === status
                    ? "bg-vla-orange text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "Tous" : translateStatus(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-vla-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">Chargement...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 font-semibold">
              Aucune demande d'achat pour le moment
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-gray-500">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-gray-500">
                    Prospect
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-gray-500">
                    Téléphone
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-gray-500">
                    Véhicule
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
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-gray-100 hover:bg-vla-beige/30 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {formatRelativeDate(lead.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-vla-black">{lead.prenom}</p>
                      {lead.message && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {lead.message}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <a
                        href={`tel:${lead.telephone}`}
                        className="font-mono text-sm text-vla-orange hover:underline"
                      >
                        {formatPhone(lead.telephone)}
                      </a>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {lead.vehicle.marque} {lead.vehicle.modele} ({lead.vehicle.annee})
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(lead.status)}`}>
                        {translateStatus(lead.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/leads/buy/${lead.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-vla-orange text-white text-sm font-bold hover:bg-orange-600 transition-colors"
                      >
                        Voir détails
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}