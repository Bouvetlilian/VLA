// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import StatsCard from "@/components/admin/StatsCard";
import Link from "next/link";
import { formatRelativeDate, translateStatus, getStatusBadgeClass } from "@/lib/utils/format";

type ApiStatsResponse = {
  vehicles: {
    total: number;
    PUBLISHED: number;
    DRAFT: number;
    SOLD: number;
    RESERVED: number;
  };
  buyLeads: {
    total: number;
    NEW: number;
    IN_PROGRESS: number;
    TREATED: number;
    ARCHIVED: number;
  };
  sellLeads: {
    total: number;
    NEW: number;
    IN_PROGRESS: number;
    TREATED: number;
    ARCHIVED: number;
  };
  kpis: {
    totalLeads: number;
    treatedLeads: number;
    conversionRate: number;
    activeVehicles: number;
  };
  recentActivity: {
    buyLeads: Array<{
      id: string;
      prenom: string;
      nom: string;
      status: string;
      createdAt: string;
      marque?: string;
      modele?: string;
    }>;
    sellLeads: Array<{
      id: string;
      prenom: string;
      nom: string;
      status: string;
      createdAt: string;
      marque?: string;
      modele?: string;
    }>;
  };
};

export default function AdminDashboard() {
  const [apiData, setApiData] = useState<ApiStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setApiData(data))
      .catch((err) => {
        console.error("[Dashboard] Erreur stats:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const vehicles = apiData?.vehicles ?? { total: 0, PUBLISHED: 0, DRAFT: 0, SOLD: 0, RESERVED: 0 };
  const buyLeads = apiData?.buyLeads ?? { total: 0, NEW: 0, IN_PROGRESS: 0, TREATED: 0, ARCHIVED: 0 };
  const sellLeads = apiData?.sellLeads ?? { total: 0, NEW: 0, IN_PROGRESS: 0, TREATED: 0, ARCHIVED: 0 };
  const totalNewLeads = (buyLeads.NEW ?? 0) + (sellLeads.NEW ?? 0);

  const recentLeads = [
    ...(apiData?.recentActivity?.buyLeads ?? []).map((l) => ({
      ...l,
      type: "buy" as const,
      vehicleInfo: l.marque && l.modele ? `${l.marque} ${l.modele}` : undefined,
    })),
    ...(apiData?.recentActivity?.sellLeads ?? []).map((l) => ({
      ...l,
      type: "sell" as const,
      vehicleInfo: l.marque && l.modele ? `${l.marque} ${l.modele}` : undefined,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-vla-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-black text-3xl text-vla-black mb-2">
          Tableau de bord 👋
        </h1>
        <p className="text-gray-500 font-semibold">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Alerte si l'API n'a pas répondu */}
      {error && !loading && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 font-semibold text-sm">
            ⚠️ Impossible de charger les statistiques. Vérifiez votre connexion ou rechargez la page.
          </p>
        </div>
      )}

      {/* Grid des KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Véhicules publiés"
          value={vehicles.PUBLISHED}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
          color="orange"
        />
        <StatsCard
          label="Leads en attente"
          value={totalNewLeads}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
          color="blue"
        />
        <StatsCard
          label="Leads achat"
          value={buyLeads.total}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
          color="orange"
        />
        <StatsCard
          label="Leads vente"
          value={sellLeads.total}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="purple"
        />
      </div>

      {/* Résumé rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Véhicules par statut */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-black text-lg text-vla-black mb-4">Catalogue</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">Publiés</span>
              <span className="font-black text-vla-orange">{vehicles.PUBLISHED}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">Brouillons</span>
              <span className="font-black text-gray-400">{vehicles.DRAFT}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">Vendus</span>
              <span className="font-black text-green-500">{vehicles.SOLD}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">Réservés</span>
              <span className="font-black text-blue-500">{vehicles.RESERVED}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500 font-semibold">Total</span>
              <span className="font-black text-vla-black">{vehicles.total}</span>
            </div>
          </div>
          <Link
            href="/admin/vehicles"
            className="mt-4 block text-center text-sm font-bold text-vla-orange hover:underline"
          >
            Gérer le catalogue →
          </Link>
        </div>

        {/* Leads achat */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-black text-lg text-vla-black mb-4">Leads achat</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">Nouveaux</span>
              <span className="font-black text-vla-orange">{buyLeads.NEW}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">En cours</span>
              <span className="font-black text-blue-500">{buyLeads.IN_PROGRESS}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">Traités</span>
              <span className="font-black text-green-500">{buyLeads.TREATED}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">Archivés</span>
              <span className="font-black text-gray-400">{buyLeads.ARCHIVED}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500 font-semibold">Total</span>
              <span className="font-black text-vla-black">{buyLeads.total}</span>
            </div>
          </div>
          <Link
            href="/admin/leads/buy"
            className="mt-4 block text-center text-sm font-bold text-vla-orange hover:underline"
          >
            Voir les leads achat →
          </Link>
        </div>

        {/* Leads vente */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-black text-lg text-vla-black mb-4">Leads vente</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">Nouveaux</span>
              <span className="font-black text-purple-500">{sellLeads.NEW}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">En cours</span>
              <span className="font-black text-blue-500">{sellLeads.IN_PROGRESS}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">Traités</span>
              <span className="font-black text-green-500">{sellLeads.TREATED}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-semibold">Archivés</span>
              <span className="font-black text-gray-400">{sellLeads.ARCHIVED}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500 font-semibold">Total</span>
              <span className="font-black text-vla-black">{sellLeads.total}</span>
            </div>
          </div>
          <Link
            href="/admin/leads/sell"
            className="mt-4 block text-center text-sm font-bold text-purple-500 hover:underline"
          >
            Voir les leads vente →
          </Link>
        </div>
      </div>

      {/* Derniers leads */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-black text-lg text-vla-black">Activité récente</h2>
          <div className="flex gap-3">
            <Link
              href="/admin/leads/buy"
              className="text-sm font-bold text-vla-orange hover:underline"
            >
              Leads achat →
            </Link>
            <Link
              href="/admin/leads/sell"
              className="text-sm font-bold text-purple-500 hover:underline"
            >
              Leads vente →
            </Link>
          </div>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-semibold">
            Aucun lead pour l'instant
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentLeads.map((lead) => (
              <Link
                key={`${lead.type}-${lead.id}`}
                href={`/admin/leads/${lead.type}/${lead.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Badge type */}
                <span
                  className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    lead.type === "buy"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {lead.type === "buy" ? "Achat" : "Vente"}
                </span>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-vla-black truncate">
                    {lead.prenom} {lead.nom}
                  </p>
                  {lead.vehicleInfo && (
                    <p className="text-sm text-gray-500 truncate">{lead.vehicleInfo}</p>
                  )}
                </div>

                {/* Statut */}
                <span
                  className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(lead.status)}`}
                >
                  {translateStatus(lead.status)}
                </span>

                {/* Date */}
                <span className="shrink-0 text-xs text-gray-400 font-semibold">
                  {formatRelativeDate(lead.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}