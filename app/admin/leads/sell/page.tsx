// app/admin/leads/sell/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Liste des demandes de vente (leads sell) - Back office admin
// Thème VIOLET - Onglets visuels améliorés
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatRelativeDate, translateStatus, getStatusBadgeClass, formatPhone, formatKilometrage } from "@/lib/utils/format";

type SellLead = {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  status: string;
  createdAt: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
};

type Stats = {
  total: number;
  new: number;
  inProgress: number;
  treated: number;
};

export default function SellLeadsPage() {
  const [leads, setLeads] = useState<SellLead[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, new: 0, inProgress: 0, treated: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.append("status", statusFilter);

        const response = await fetch(`/api/admin/leads/sell?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setLeads(data.leads || []);
          setStats(data.stats || { total: 0, new: 0, inProgress: 0, treated: 0 });
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [statusFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Onglets de navigation AMÉLIORÉS */}
      <div className="mb-8">
        <div className="flex gap-3 mb-6">
          {/* Onglet ACHAT - Inactif */}
          <Link
            href="/admin/leads/buy"
            className="flex-1 group"
          >
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg transition-all hover:border-orange-500 hover:shadow-xl group-hover:bg-orange-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-orange-100 rounded-xl flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-black text-xl text-gray-400 group-hover:text-orange-600 transition-colors">Demandes d'Achat</h2>
                    <p className="text-sm text-gray-400 font-semibold">Prospects acheteurs</p>
                  </div>
                </div>
                <div className="bg-gray-100 group-hover:bg-orange-100 px-4 py-2 rounded-full transition-colors">
                  <p className="text-3xl font-black text-gray-400 group-hover:text-orange-600 transition-colors">→</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Onglet VENTE - Actif */}
          <Link
            href="/admin/leads/sell"
            className="flex-1 group"
          >
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg transition-all hover:shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-black text-xl text-white">Demandes de Vente</h2>
                    <p className="text-sm text-white/80 font-semibold">Prospects vendeurs</p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-3xl font-black text-white">{stats.total}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-purple-100">
          <p className="text-xs font-black uppercase text-purple-400 mb-1">Total</p>
          <p className="text-2xl font-black text-purple-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-purple-100">
          <p className="text-xs font-black uppercase text-purple-400 mb-1">Nouveaux</p>
          <p className="text-2xl font-black text-purple-500">{stats.new}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-purple-100">
          <p className="text-xs font-black uppercase text-purple-400 mb-1">En cours</p>
          <p className="text-2xl font-black text-blue-500">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-purple-100">
          <p className="text-xs font-black uppercase text-purple-400 mb-1">Traités</p>
          <p className="text-2xl font-black text-green-500">{stats.treated}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border-2 border-purple-100">
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
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                {status === "all" ? "Tous" : translateStatus(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-purple-100">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">Chargement...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-semibold">
              Aucune demande de vente pour le moment
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-purple-600">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-purple-600">
                    Vendeur
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-purple-600">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-purple-600">
                    Véhicule à vendre
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-purple-600">
                    Km
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-black uppercase text-purple-600">
                    Statut
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-black uppercase text-purple-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-purple-100 hover:bg-purple-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {formatRelativeDate(lead.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-vla-black">
                        {lead.prenom} {lead.nom}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <a
                        href={`tel:${lead.telephone}`}
                        className="font-mono text-sm text-purple-600 hover:underline block font-bold"
                      >
                        {formatPhone(lead.telephone)}
                      </a>
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        {lead.email}
                      </a>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      <span className="font-bold">{lead.marque} {lead.modele}</span>
                      <br />
                      <span className="text-xs text-gray-500">{lead.annee}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {formatKilometrage(lead.kilometrage)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(lead.status)}`}>
                        {translateStatus(lead.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/leads/sell/${lead.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-bold hover:bg-purple-600 transition-colors"
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