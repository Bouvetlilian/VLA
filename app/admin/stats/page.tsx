// app/admin/stats/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Page Statistiques complète - Back office admin
// KPIs, graphiques, top marques, véhicules populaires
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatPrice, formatRelativeDate, translateStatus, getStatusBadgeClass } from "@/lib/utils/format";

type StatsData = {
  kpis: {
    totalLeads: number;
    treatedLeads: number;
    conversionRate: number;
    activeVehicles: number;
  };
  timeline: Array<{
    week: string;
    buyLeads: number;
    sellLeads: number;
    total: number;
  }>;
  topBrands: Array<{
    brand: string;
    count: number;
  }>;
  topVehicles: Array<{
    id: number;
    slug: string;
    marque: string;
    modele: string;
    annee: number;
    prix: number;
    leadsCount: number;
  }>;
  vehicleStatusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  leadsTypeDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  recentActivity: {
    buyLeads: any[];
    sellLeads: any[];
  };
};

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();

        if (response.ok) {
          setStats(data);
        } else {
          console.error("Erreur:", data.error);
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="w-12 h-12 border-4 border-vla-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-12 text-center">
          <p className="text-red-600 font-bold">Erreur lors du chargement des statistiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-black text-3xl text-vla-black mb-2">
          Statistiques & Analyses
        </h1>
        <p className="text-gray-500 font-semibold">
          Vue d'ensemble des performances et tendances
        </p>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm font-bold opacity-90 mb-1">Total Leads</p>
          <p className="text-4xl font-black mb-2">{stats.kpis.totalLeads}</p>
          <p className="text-xs opacity-75">Demandes d'achat + vente</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm font-bold opacity-90 mb-1">Taux de Conversion</p>
          <p className="text-4xl font-black mb-2">{stats.kpis.conversionRate}%</p>
          <p className="text-xs opacity-75">{stats.kpis.treatedLeads} leads traités</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm font-bold opacity-90 mb-1">Véhicules Actifs</p>
          <p className="text-4xl font-black mb-2">{stats.kpis.activeVehicles}</p>
          <p className="text-xs opacity-75">Publiés sur le site</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm font-bold opacity-90 mb-1">Activité Récente</p>
          <p className="text-4xl font-black mb-2">{stats.timeline[3]?.total || 0}</p>
          <p className="text-xs opacity-75">Leads cette semaine</p>
        </div>
      </div>

      {/* Graphiques en 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Évolution des leads */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Évolution des Leads (4 dernières semaines)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #f0f0f0",
                  borderRadius: "12px",
                  fontWeight: "600",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="buyLeads"
                name="Demandes d'achat"
                stroke="#FF8633"
                strokeWidth={3}
                dot={{ fill: "#FF8633", r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="sellLeads"
                name="Demandes de vente"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: "#8B5CF6", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition Achat vs Vente */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Répartition des Leads
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.leadsTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.leadsTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Marques + Statut Véhicules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top 5 Marques */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Top 5 Marques les Plus Demandées
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topBrands} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="brand" type="category" stroke="#666" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #f0f0f0",
                  borderRadius: "12px",
                  fontWeight: "600",
                }}
              />
              <Bar dataKey="count" name="Demandes" fill="#FF8633" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition Véhicules par Statut */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-6">
            Véhicules par Statut
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.vehicleStatusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {stats.vehicleStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Véhicules les Plus Populaires */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <h2 className="font-black text-xl text-vla-black mb-6">
          Véhicules les Plus Populaires
        </h2>

        {stats.topVehicles.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Aucun véhicule avec des leads pour le moment</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-black uppercase text-gray-500">
                    Rang
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-black uppercase text-gray-500">
                    Véhicule
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-black uppercase text-gray-500">
                    Prix
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-black uppercase text-gray-500">
                    Demandes
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-black uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topVehicles.map((vehicle, index) => (
                  <tr key={vehicle.id} className="border-t border-gray-100 hover:bg-vla-beige/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white ${
                        index === 0 ? "bg-yellow-500" :
                        index === 1 ? "bg-gray-400" :
                        index === 2 ? "bg-orange-400" :
                        "bg-gray-300"
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-vla-black">
                        {vehicle.marque} {vehicle.modele}
                      </p>
                      <p className="text-sm text-gray-500">{vehicle.annee}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-vla-orange">
                      {formatPrice(vehicle.prix)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                        {vehicle.leadsCount} demande{vehicle.leadsCount > 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/admin/vehicles/${vehicle.id}/edit`}
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

      {/* Activité Récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers Leads Achat */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-4">
            Dernières Demandes d'Achat
          </h2>
          <div className="space-y-3">
            {stats.recentActivity.buyLeads.slice(0, 5).map((lead: any) => (
              <Link
                key={lead.id}
                href={`/admin/leads/buy/${lead.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group"
              >
                <div>
                  <p className="font-bold text-vla-black group-hover:text-vla-orange">
                    {lead.prenom}
                  </p>
                  <p className="text-sm text-gray-600">
                    {lead.vehicle.marque} {lead.vehicle.modele}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeDate(lead.createdAt)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(lead.status)}`}>
                  {translateStatus(lead.status)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Derniers Leads Vente */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="font-black text-xl text-vla-black mb-4">
            Dernières Demandes de Vente
          </h2>
          <div className="space-y-3">
            {stats.recentActivity.sellLeads.slice(0, 5).map((lead: any) => (
              <Link
                key={lead.id}
                href={`/admin/leads/sell/${lead.id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors group"
              >
                <div>
                  <p className="font-bold text-vla-black group-hover:text-purple-600">
                    {lead.prenom} {lead.nom}
                  </p>
                  <p className="text-sm text-gray-600">
                    {lead.marque} {lead.modele} ({lead.annee})
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeDate(lead.createdAt)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(lead.status)}`}>
                  {translateStatus(lead.status)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}