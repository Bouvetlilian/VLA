// app/admin/leads/sell/[id]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Détail d'une demande de vente - Back office admin
// Affichage complet avec photos + actions
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate, formatRelativeDate, translateStatus, getStatusBadgeClass, formatPhone, formatKilometrage } from "@/lib/utils/format";

type SellLead = {
  id: string;
  // Étape 1 : Véhicule
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  carburant: string;
  boite: string;
  // Étape 2 : État
  etat: string;
  carnet: string;
  accident: string;
  commentaire: string | null;
  // Étape 3 : Coordonnées
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  // Gestion
  status: string;
  notes: string | null;
  estimation: string | null;
  createdAt: string;
  updatedAt: string;
  photos: Array<{ url: string }>;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function SellLeadDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const leadId = resolvedParams.id;

  const [lead, setLead] = useState<SellLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [newStatus, setNewStatus] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newEstimation, setNewEstimation] = useState("");

  // Photo sélectionnée pour la lightbox
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Charger le lead
  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await fetch(`/api/admin/leads/sell/${leadId}`);
        const data = await response.json();

        if (response.ok) {
          setLead(data.lead);
          setNewStatus(data.lead.status);
          setNewNotes(data.lead.notes || "");
          setNewEstimation(data.lead.estimation || "");
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

  // Sauvegarder
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/leads/sell/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes: newNotes || null,
          estimation: newEstimation || null,
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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="w-12 h-12 border-4 border-vla-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-12 text-center">
          <p className="text-red-600 font-bold mb-4">{error || "Lead introuvable"}</p>
          <Link
            href="/admin/leads/sell"
            className="text-sm font-bold text-vla-orange hover:underline"
          >
            ← Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/leads/sell"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-vla-orange mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux demandes de vente
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-black text-3xl text-vla-black mb-2">
              Demande de vente - {lead.prenom} {lead.nom}
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
        {/* Colonne gauche : Infos véhicule + vendeur */}
        <div className="lg:col-span-2 space-y-6">
          {/* Véhicule à vendre */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-black text-xl text-vla-black mb-4">
              Véhicule à racheter
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Marque</p>
                <p className="font-bold text-vla-black">{lead.marque}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Modèle</p>
                <p className="font-bold text-vla-black">{lead.modele}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Année</p>
                <p className="font-bold text-vla-black">{lead.annee}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Kilométrage</p>
                <p className="font-bold text-vla-black">{formatKilometrage(lead.kilometrage)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Carburant</p>
                <p className="font-bold text-vla-black">{lead.carburant}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Boîte</p>
                <p className="font-bold text-vla-black">{lead.boite}</p>
              </div>
            </div>

            {/* État du véhicule */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-black text-sm text-gray-400 uppercase mb-3">
                État du véhicule
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">État général</p>
                  <p className="font-bold text-sm">{lead.etat}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Carnet d'entretien</p>
                  <p className="font-bold text-sm">{lead.carnet}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Accident(s)</p>
                  <p className="font-bold text-sm">{lead.accident}</p>
                </div>
              </div>

              {lead.commentaire && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">Commentaire du vendeur</p>
                  <p className="text-sm bg-gray-50 rounded-xl p-3">{lead.commentaire}</p>
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          {lead.photos.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="font-black text-xl text-vla-black mb-4">
                Photos du véhicule ({lead.photos.length})
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lead.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(photo.url)}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 hover:ring-4 hover:ring-vla-orange/50 transition-all"
                  >
                    <Image
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Infos vendeur */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="font-black text-xl text-vla-black mb-4">
              Informations du vendeur
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-vla-orange/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-vla-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Nom complet</p>
                  <p className="font-bold text-vla-black">{lead.prenom} {lead.nom}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Téléphone</p>
                  <a href={`tel:${lead.telephone}`} className="font-mono font-bold text-green-600 hover:underline">
                    {formatPhone(lead.telephone)}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                  <a href={`mailto:${lead.email}`} className="font-semibold text-blue-600 hover:underline">
                    {lead.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Boutons contact */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <a
                href={`tel:${lead.telephone}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Appeler
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            </div>
          </div>
        </div>

        {/* Colonne droite : Actions */}
        <div className="space-y-6">
          {/* Actions */}
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
                  Estimation proposée
                </label>
                <input
                  type="text"
                  value={newEstimation}
                  onChange={(e) => setNewEstimation(e.target.value)}
                  placeholder="Ex: 15 000 - 18 000 €"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
                />
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

      {/* Lightbox photos */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-vla-orange"
            onClick={() => setSelectedPhoto(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Image
            src={selectedPhoto}
            alt="Photo agrandie"
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
}