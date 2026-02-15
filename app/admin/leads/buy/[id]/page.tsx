// app/admin/leads/buy/[id]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Détail d'une demande d'achat - Back office admin
// Affichage complet + actions (changement statut, notes, etc.)
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDate, formatRelativeDate, translateStatus, getStatusBadgeClass, formatPhone, formatPrice, formatKilometrage } from "@/lib/utils/format";

type BuyLead = {
  id: string;
  prenom: string;
  telephone: string;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle: {
    id: number;
    slug: string;
    marque: string;
    modele: string;
    annee: number;
    prix: number;
    kilometrage: number;
    carburant: string;
    images: Array<{ url: string; isMain: boolean }>;
  };
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function BuyLeadDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const leadId = resolvedParams.id;
  const router = useRouter();

  const [lead, setLead] = useState<BuyLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [newStatus, setNewStatus] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Charger le lead
  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await fetch(`/api/admin/leads/buy/${leadId}`);
        const data = await response.json();

        if (response.ok) {
          setLead(data.lead);
          setNewStatus(data.lead.status);
          setNewNotes(data.lead.notes || "");
        } else {
          setError("Lead introuvable");
        }
      } catch (err) {
        setError("Erreur lors du chargement");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId]);

  // Sauvegarder les modifications
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/leads/buy/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: newNotes || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLead(data.lead);
        alert("Lead mis à jour avec succès");
      } else {
        const data = await response.json();
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      alert("Erreur lors de la sauvegarde");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="w-12 h-12 border-4 border-vla-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-12 text-center">
          <p className="text-red-600 font-bold mb-4">{error || "Lead introuvable"}</p>
          <Link
            href="/admin/leads/buy"
            className="text-sm font-bold text-vla-orange hover:underline"
          >
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = lead.vehicle.images.find((img) => img.isMain) || lead.vehicle.images[0];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/leads/buy"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-vla-orange mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux demandes d'achat
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-black text-3xl text-vla-black mb-2">
              Demande d'achat - {lead.prenom}
            </h1>
            <p className="text-gray-500 font-semibold">
              Reçue {formatRelativeDate(lead.createdAt)} • {formatDate(lead.createdAt)}
            </p>
          </div>

          <span className={`px-4 py-2 rounded-xl text-sm font-bold ${getStatusBadgeClass(lead.status)}`}>
            {translateStatus(lead.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : Infos lead + véhicule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Infos prospect */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-black text-xl text-vla-black mb-4">
              Informations du prospect
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-vla-orange/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-vla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Prénom</p>
                  <p className="font-bold text-vla-black">{lead.prenom}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Téléphone</p>
                  <a
                    href={`tel:${lead.telephone}`}
                    className="font-mono font-bold text-green-600 hover:underline"
                  >
                    {formatPhone(lead.telephone)}
                  </a>
                </div>
              </div>

              {lead.message && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Message</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">
                      {lead.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton appeler */}
            <a
              href={`tel:${lead.telephone}`}
              className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Appeler le prospect
            </a>
          </div>

          {/* Véhicule concerné */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-black text-xl text-vla-black mb-4">
              Véhicule concerné
            </h2>

            <div className="flex gap-4">
              {/* Image */}
              {mainImage && (
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={mainImage.url}
                    alt={`${lead.vehicle.marque} ${lead.vehicle.modele}`}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Infos */}
              <div className="flex-1">
                <h3 className="font-black text-xl text-vla-black mb-2">
                  {lead.vehicle.marque} {lead.vehicle.modele}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Année : <span className="font-bold">{lead.vehicle.annee}</span></p>
                  <p>Kilométrage : <span className="font-bold">{formatKilometrage(lead.vehicle.kilometrage)}</span></p>
                  <p>Carburant : <span className="font-bold">{lead.vehicle.carburant}</span></p>
                  <p className="text-lg font-black text-vla-orange mt-2">
                    {formatPrice(lead.vehicle.prix)}
                  </p>
                </div>

                <Link
                  href={`/admin/vehicles/${lead.vehicle.id}/edit`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-vla-orange hover:underline"
                >
                  Voir la fiche véhicule
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite : Actions */}
        <div className="space-y-6">
          {/* Changer le statut */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-black text-lg text-vla-black mb-4">
              Actions
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
                >
                  <option value="NEW">Nouveau</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="TREATED">Traité</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Notes internes
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none resize-none"
                  placeholder="Ajouter des notes..."
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>

          {/* Historique */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-black text-lg text-vla-black mb-4">
              Historique
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                <div>
                  <p className="text-gray-500">Créé le</p>
                  <p className="font-bold text-vla-black">{formatDate(lead.createdAt)}</p>
                </div>
              </div>

              {lead.updatedAt !== lead.createdAt && (
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div>
                    <p className="text-gray-500">Dernière modification</p>
                    <p className="font-bold text-vla-black">{formatDate(lead.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}