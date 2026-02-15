// app/admin/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Dashboard administrateur VL Automobiles
// Vue d'ensemble avec KPIs, graphique et derniers leads
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StatsCard from "@/components/admin/StatsCard";
import Link from "next/link";
import { formatRelativeDate, translateStatus, getStatusBadgeClass } from "@/lib/utils/format";

// Types pour les données de l'API
type DashboardStats = {
  vehiclesCount: {
    total: number;
    published: number;
    draft: number;
    sold: number;
  };
  leadsCount: {
    buy: {
      total: number;
      new: number;
      inProgress: number;
      treated: number;
    };
    sell: {
      total: number;
      new: number;
      inProgress: number;
      treated: number;
    };
  };
  recentLeads: Array<{
    id: string;
    type: "buy" | "sell";
    prenom: string;
    telephone: string;
    status: string;
    createdAt: string;
    vehicleInfo?: string; // Pour buy leads: "BMW Série 3"
  }>;
};

async function getDashboardStats(): Promise<DashboardStats> {
  // Retourner des données par défaut pour l'instant
  // L'API /api/admin/stats sera utilisée quand elle sera disponible
  return {
    vehiclesCount: { total: 0, published: 0, draft: 0, sold: 0 },
    leadsCount: {
      buy: { total: 0, new: 0, inProgress: 0, treated: 0 },
      sell: { total: 0, new: 0, inProgress: 0, treated: 0 },
    },
    recentLeads: [],
  };
}

export default async function AdminDashboard() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const stats = await getDashboardStats();

  // Calculer les leads totaux NEW
  const totalNewLeads = stats.leadsCount.buy.new + stats.leadsCount.sell.new;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-black text-3xl text-vla-black mb-2">
          Bienvenue, {session.user.name} 👋
        </h1>
        <p className="text-gray-500 font-semibold">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Grid des KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Véhicules actifs */}
        <StatsCard
          label="Véhicules publiés"
          value={stats.vehiclesCount.published}
          color="orange"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
        />

        {/* Nouveaux leads */}
        <StatsCard
          label="Nouveaux leads"
          value={totalNewLeads}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />

        {/* Leads achat en cours */}
        <StatsCard
          label="Demandes d'achat"
          value={stats.leadsCount.buy.total}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
        />

        {/* Leads vente en cours */}
        <StatsCard
          label="Demandes de vente"
          value={stats.leadsCount.sell.total}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Section leads récents */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-xl text-vla-black">
            Derniers leads
          </h2>
          <Link
            href="/admin/leads/buy"
            className="text-sm font-bold text-vla-orange hover:underline"
          >
            Voir tout →
          </Link>
        </div>

        {stats.recentLeads.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-semibold">
              Aucun lead pour le moment
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-black uppercase text-gray-400">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-black uppercase text-gray-400">
                    Prospect
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-black uppercase text-gray-400">
                    Téléphone
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-black uppercase text-gray-400">
                    Véhicule
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-black uppercase text-gray-400">
                    Statut
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-black uppercase text-gray-400">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-black uppercase text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100 hover:bg-vla-beige/30 transition-colors">
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          lead.type === "buy"
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {lead.type === "buy" ? "Achat" : "Vente"}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-vla-black">
                      {lead.prenom}
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-mono text-sm">
                      {lead.telephone}
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">
                      {lead.vehicleInfo || "-"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(lead.status)}`}
                      >
                        {translateStatus(lead.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-sm">
                      {formatRelativeDate(lead.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/admin/leads/${lead.type}/${lead.id}`}
                        className="text-sm font-bold text-vla-orange hover:underline"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Boutons rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link
          href="/admin/vehicles/new"
          className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-vla-orange/10 text-vla-orange flex items-center justify-center group-hover:bg-vla-orange group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-black text-vla-black">Ajouter un véhicule</p>
              <p className="text-sm text-gray-500">Créer une nouvelle annonce</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/vehicles"
          className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="font-black text-vla-black">Gérer les véhicules</p>
              <p className="text-sm text-gray-500">Modifier le catalogue</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/leads/buy"
          className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="font-black text-vla-black">Traiter les leads</p>
              <p className="text-sm text-gray-500">Gérer les demandes</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}