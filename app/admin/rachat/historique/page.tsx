"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Estimation {
  id: string;
  marque: string;
  modele: string;
  version: string | null;
  annee: number;
  kilometrage: number;
  carburant: string;
  boite: string;
  etat: string | null;
  marchePrixMedian: number;
  rachatPrixConseille: number;
  rachatMargeEstimee: string;
  marcheTendance: string;
  marcheLiquidite: string;
  adminName: string | null;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function formatKm(km: number): string {
  return new Intl.NumberFormat("fr-FR").format(km) + " km";
}

function TendanceBadge({ tendance }: { tendance: string }) {
  if (tendance === "hausse") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
      ↑ Hausse
    </span>
  );
  if (tendance === "baisse") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
      ↓ Baisse
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
      → Stable
    </span>
  );
}

function LiquiditeBadge({ liquidite }: { liquidite: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    forte: { bg: "bg-green-100", text: "text-green-700", label: "Forte" },
    normale: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Normale" },
    faible: { bg: "bg-red-100", text: "text-red-700", label: "Faible" },
  };
  const c = config[liquidite] || config.normale;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function EtatBadge({ etat }: { etat: string | null }) {
  if (!etat) return <span className="text-gray-400 text-xs">—</span>;
  const config: Record<string, string> = {
    "Excellent": "bg-green-100 text-green-700",
    "Bon": "bg-blue-100 text-blue-700",
    "Correct": "bg-yellow-100 text-yellow-700",
    "À rénover": "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${config[etat] || "bg-gray-100 text-gray-600"}`}>
      {etat}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────

export default function HistoriqueRachatPage() {
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filtreMarque, setFiltreMarque] = useState("");

  const fetchHistorique = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (filtreMarque) params.set("marque", filtreMarque);

      const res = await fetch(`/api/admin/rachat/historique?${params}`);
      const data = await res.json();
      setEstimations(data.estimations || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error("Erreur chargement historique:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filtreMarque]);

  useEffect(() => {
    fetchHistorique();
  }, [fetchHistorique]);

  return (
    <div className="min-h-screen bg-vla-beige">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vla-orange rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="font-black text-2xl text-vla-black">Historique des cotations</h1>
              <p className="text-sm text-gray-500 font-semibold">
                {pagination ? `${pagination.total} estimation${pagination.total > 1 ? "s" : ""} au total` : "Chargement..."}
              </p>
            </div>
          </div>

          <Link
            href="/admin/rachat"
            className="flex items-center gap-2 px-5 py-2.5 bg-vla-orange text-white font-black text-sm rounded-xl hover:bg-opacity-90 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle cotation
          </Link>
        </div>

        {/* Filtre marque */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-4">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <input
            type="text"
            value={filtreMarque}
            onChange={(e) => { setFiltreMarque(e.target.value); setPage(1); }}
            placeholder="Filtrer par marque (ex : Peugeot, BMW...)"
            className="flex-1 text-sm font-semibold text-vla-black placeholder-gray-400 focus:outline-none"
          />
          {filtreMarque && (
            <button
              onClick={() => { setFiltreMarque(""); setPage(1); }}
              className="text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <svg className="w-8 h-8 text-vla-orange animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-gray-500 font-semibold">Chargement...</p>
            </div>
          ) : estimations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="font-bold text-vla-black mb-1">Aucune cotation enregistrée</p>
              <p className="text-sm text-gray-500">Les prochaines analyses seront sauvegardées automatiquement.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wide">Véhicule</th>
                    <th className="text-left px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wide">Km / État</th>
                    <th className="text-right px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wide">Prix marché</th>
                    <th className="text-right px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wide">Prix rachat</th>
                    <th className="text-center px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wide">Marché</th>
                    <th className="text-left px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wide">Commercial</th>
                    <th className="text-left px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {estimations.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/rachat/historique/${e.id}`}>
                      {/* Véhicule */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-black text-sm text-vla-black">
                            {e.marque} {e.modele}
                          </p>
                          <p className="text-xs text-gray-500 font-semibold">
                            {e.version || `${e.carburant} · ${e.boite}`} · {e.annee}
                          </p>
                        </div>
                      </td>

                      {/* Km / État */}
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-vla-black">{formatKm(e.kilometrage)}</p>
                        <div className="mt-1">
                          <EtatBadge etat={e.etat} />
                        </div>
                      </td>

                      {/* Prix marché médian */}
                      <td className="px-4 py-4 text-right">
                        <p className="font-black text-sm text-vla-black">{formatPrice(e.marchePrixMedian)}</p>
                        <div className="mt-1 flex justify-end">
                          <TendanceBadge tendance={e.marcheTendance} />
                        </div>
                      </td>

                      {/* Prix rachat conseillé */}
                      <td className="px-4 py-4 text-right">
                        <p className="font-black text-base text-vla-orange">{formatPrice(e.rachatPrixConseille)}</p>
                        <p className="text-xs text-gray-400 font-semibold">{e.rachatMargeEstimee}</p>
                      </td>

                      {/* Liquidité */}
                      <td className="px-4 py-4 text-center">
                        <LiquiditeBadge liquidite={e.marcheLiquidite} />
                      </td>

                      {/* Commercial */}
                      <td className="px-4 py-4">
                        <p className="text-xs font-semibold text-gray-600">
                          {e.adminName || "—"}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4">
                        <p className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                          {formatDate(e.createdAt)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-semibold">
                Page {pagination.page} sur {pagination.totalPages} · {pagination.total} résultats
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}