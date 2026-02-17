"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EstimationDetail {
  id: string;
  marque: string;
  modele: string;
  version: string | null;
  annee: number;
  kilometrage: number;
  carburant: string;
  boite: string;
  couleur: string | null;
  puissance: string | null;
  etat: string | null;
  carnet: string | null;
  accident: string | null;
  options: string[];
  commentaire: string | null;
  marchePrixMin: number;
  marchePrixMax: number;
  marchePrixMedian: number;
  marcheTendance: string;
  marcheLiquidite: string;
  marcheResume: string;
  rachatPrixMin: number;
  rachatPrixMax: number;
  rachatPrixConseille: number;
  rachatMargeEstimee: string;
  rachatFraisRemiseEnEtat: number;
  rachatExplication: string;
  vigilance: {
    mecanique?: string[];
    carrosserie?: string[];
    administratif?: string[];
    marche?: string[];
    specifiques?: string[];
  };
  synthese: string;
  adminId: string | null;
  adminName: string | null;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Composant ───────────────────────────────────────────────────────────────

export default function EstimationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [estimation, setEstimation] = useState<EstimationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/admin/rachat/historique/${id}`);
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();
        setEstimation(data.estimation);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-vla-beige flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-8 h-8 text-vla-orange animate-spin mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-gray-500 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!estimation) {
    return (
      <div className="min-h-screen bg-vla-beige flex items-center justify-center">
        <div className="text-center">
          <p className="font-bold text-vla-black mb-2">Estimation introuvable</p>
          <Link
            href="/admin/rachat/historique"
            className="text-sm text-vla-orange font-semibold hover:underline"
          >
            ← Retour à l'historique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vla-beige">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/rachat/historique"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-vla-orange mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'historique
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-black text-3xl text-vla-black mb-2">
                {estimation.marque} {estimation.modele}
              </h1>
              <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
                <span>{estimation.annee}</span>
                <span>·</span>
                <span>{formatKm(estimation.kilometrage)}</span>
                <span>·</span>
                <span>{estimation.carburant}</span>
                <span>·</span>
                <span>{estimation.boite}</span>
              </div>
              <p className="text-xs text-gray-400 font-semibold mt-2">
                Analysé le {formatDate(estimation.createdAt)} par {estimation.adminName || "Admin"}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-vla-black text-white font-black text-sm rounded-xl hover:bg-opacity-80 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Imprimer
            </button>
          </div>
        </div>

        {/* Synthèse globale */}
        {estimation.synthese && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6 mb-6">
            <h2 className="font-black text-base text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Synthèse de l'analyse
            </h2>
            <p className="text-sm text-blue-900 leading-relaxed font-semibold">
              {estimation.synthese}
            </p>
          </div>
        )}

        {/* Grille : Marché + Rachat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* État du marché */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-base text-vla-black mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-vla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              État du marché
            </h3>

            <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                Prix médian marché
              </p>
              <p className="font-black text-3xl text-vla-black">{formatPrice(estimation.marchePrixMedian)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase">Bas du marché</p>
                <p className="font-black text-lg text-vla-black">{formatPrice(estimation.marchePrixMin)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase">Haut du marché</p>
                <p className="font-black text-lg text-vla-black">{formatPrice(estimation.marchePrixMax)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  estimation.marcheTendance === "hausse"
                    ? "bg-green-100 text-green-700"
                    : estimation.marcheTendance === "baisse"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {estimation.marcheTendance === "hausse"
                  ? "↑ Hausse"
                  : estimation.marcheTendance === "baisse"
                    ? "↓ Baisse"
                    : "→ Stable"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  estimation.marcheLiquidite === "elevee"
                    ? "bg-green-100 text-green-700"
                    : estimation.marcheLiquidite === "faible"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                Liquidité{" "}
                {estimation.marcheLiquidite === "elevee"
                  ? "forte"
                  : estimation.marcheLiquidite === "faible"
                    ? "faible"
                    : "normale"}
              </span>
            </div>

            {estimation.marcheResume && (
              <div className="bg-gray-50 rounded-xl p-3 border-l-4 border-gray-300">
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  {estimation.marcheResume}
                </p>
              </div>
            )}
          </div>

          {/* Recommandation rachat */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-orange-200">
            <h3 className="font-black text-base text-vla-black mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-vla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Recommandation de rachat
            </h3>

            <div className="bg-orange-50 border-2 border-vla-orange rounded-2xl p-5 mb-4 text-center">
              <p className="text-xs font-bold text-vla-orange uppercase tracking-wide mb-1">
                Prix de rachat conseillé
              </p>
              <p className="font-black text-4xl text-vla-orange">
                {formatPrice(estimation.rachatPrixConseille)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase">Offre mini</p>
                <p className="font-black text-lg text-vla-black">{formatPrice(estimation.rachatPrixMin)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase">Offre maxi</p>
                <p className="font-black text-lg text-vla-black">{formatPrice(estimation.rachatPrixMax)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Marge estimée</p>
                <p className="font-bold text-sm text-green-600">{estimation.rachatMargeEstimee}</p>
              </div>
              {estimation.rachatFraisRemiseEnEtat > 0 && (
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase">Frais remise état</p>
                  <p className="font-bold text-sm text-red-500">
                    ~{formatPrice(estimation.rachatFraisRemiseEnEtat)}
                  </p>
                </div>
              )}
            </div>

            {estimation.rachatExplication && (
              <div className="bg-gray-50 rounded-xl p-3 border-l-4 border-orange-400">
                <p className="text-xs text-gray-700 font-semibold leading-relaxed whitespace-pre-line">
                  {estimation.rachatExplication}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Points de vigilance */}
        {estimation.vigilance && Object.values(estimation.vigilance).some((v) => v && v.length > 0) && (
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
            <h3 className="font-black text-base text-vla-black mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-vla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Points de vigilance avant rachat
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: "mecanique", label: "Mécanique", icon: "🔧", color: "red" },
                { key: "carrosserie", label: "Carrosserie", icon: "🚘", color: "orange" },
                { key: "administratif", label: "Administratif", icon: "📋", color: "blue" },
                { key: "marche", label: "Marché / Revente", icon: "📊", color: "purple" },
                { key: "specifiques", label: "Spécifiques", icon: "⚡", color: "yellow" },
              ]
                .filter((cat) => {
                  const items = estimation.vigilance[cat.key as keyof typeof estimation.vigilance];
                  return items && items.length > 0;
                })
                .map((cat) => {
                  const items = estimation.vigilance[cat.key as keyof typeof estimation.vigilance] || [];
                  return (
                    <div key={cat.key} className="bg-gray-50 rounded-2xl p-4">
                      <p className="font-black text-sm text-vla-black mb-3 flex items-center gap-2">
                        <span>{cat.icon}</span>
                        {cat.label}
                      </p>
                      <ul className="space-y-2">
                        {items.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-vla-orange flex-shrink-0 mt-1.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Informations du véhicule */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-black text-base text-vla-black mb-5">Informations du véhicule analysé</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {estimation.version && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Version</p>
                <p className="font-semibold text-vla-black">{estimation.version}</p>
              </div>
            )}
            {estimation.couleur && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Couleur</p>
                <p className="font-semibold text-vla-black">{estimation.couleur}</p>
              </div>
            )}
            {estimation.puissance && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Puissance</p>
                <p className="font-semibold text-vla-black">{estimation.puissance}</p>
              </div>
            )}
            {estimation.etat && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">État</p>
                <p className="font-semibold text-vla-black">{estimation.etat}</p>
              </div>
            )}
            {estimation.carnet && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Carnet entretien</p>
                <p className="font-semibold text-vla-black">{estimation.carnet}</p>
              </div>
            )}
            {estimation.accident && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Historique accident</p>
                <p className="font-semibold text-vla-black">{estimation.accident}</p>
              </div>
            )}
          </div>

          {estimation.options && estimation.options.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Options / Équipements</p>
              <div className="flex flex-wrap gap-2">
                {estimation.options.map((opt, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {estimation.commentaire && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Observations</p>
              <p className="text-sm text-gray-700 font-semibold leading-relaxed whitespace-pre-line">
                {estimation.commentaire}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}