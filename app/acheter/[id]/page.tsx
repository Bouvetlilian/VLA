"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getVehicleById, getPrevNextVehicles, type Vehicle } from "@/lib/data";

// ─── Numéro commercial ────────────────────────────────────────────────────────
const PHONE_NUMBER = "06 60 65 47 51"; // ← À remplacer par le vrai numéro
const PHONE_HREF = "tel:+33660654751"; // ← À remplacer

// ─── Modal contact ────────────────────────────────────────────────────────────

function ContactModal({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle;
  onClose: () => void;
}) {
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [message, setMessage] = useState(
    `Bonjour, je suis intéressé(e) par votre ${vehicle.marque} ${vehicle.modele} (${vehicle.annee}) à ${vehicle.prix.toLocaleString("fr-FR")} €. Pouvez-vous me recontacter ?`
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = () => {
    if (!prenom || !telephone) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1400);
  };

  const isValid = prenom.trim() && telephone.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{
          boxShadow: "0 25px 80px rgba(0,0,0,0.2)",
          animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="font-black text-base text-vla-black">Je suis intéressé(e)</p>
            <p className="text-xs text-gray-400 font-semibold">
              {vehicle.marque} {vehicle.modele} — {vehicle.prix.toLocaleString("fr-FR")} €
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corps */}
        <div className="px-6 py-6">
          {sent ? (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(255,134,51,0.1)", animation: "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="font-black text-lg text-vla-black mb-1">Message envoyé !</p>
              <p className="text-sm text-gray-400 font-semibold">
                On vous rappelle très vite, {prenom} 👋
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-full bg-vla-orange text-white font-black text-sm"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  placeholder="Votre prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full bg-vla-beige border-2 border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-vla-black placeholder-gray-400 outline-none focus:border-vla-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  placeholder="06 XX XX XX XX"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full bg-vla-beige border-2 border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-vla-black placeholder-gray-400 outline-none focus:border-vla-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2">
                  Message
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-vla-beige border-2 border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-vla-black placeholder-gray-400 outline-none focus:border-vla-orange transition-all resize-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!isValid || sending}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-black text-sm transition-all mt-1"
                style={{
                  background: isValid && !sending ? "#FF8633" : "#e5e7eb",
                  color: isValid && !sending ? "white" : "#9ca3af",
                  boxShadow: isValid && !sending ? "0 4px 20px rgba(255,134,51,0.3)" : "none",
                }}
              >
                {sending ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Envoi...
                  </>
                ) : (
                  "Envoyer ma demande"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Galerie photos ───────────────────────────────────────────────────────────

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const switchTo = (index: number) => {
    if (index === active) return;
    setTransitioning(true);
    setTimeout(() => {
      setActive(index);
      setTransitioning(false);
    }, 200);
  };

  return (
    <div>
      {/* Image principale */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-100" style={{ aspectRatio: "16/10" }}>
        <Image
          src={images[active]}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          style={{
            opacity: transitioning ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
        />

        {/* Compteur */}
        <div
          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        >
          {active + 1} / {images.length}
        </div>

        {/* Flèches navigation galerie */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => switchTo((active - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => switchTo((active + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => switchTo(i)}
              className="relative flex-shrink-0 rounded-xl overflow-hidden transition-all"
              style={{
                width: 72,
                height: 52,
                border: i === active ? "2.5px solid #FF8633" : "2.5px solid transparent",
                opacity: i === active ? 1 : 0.55,
                transform: i === active ? "scale(1.04)" : "scale(1)",
              }}
            >
              <Image src={src} alt={`photo ${i + 1}`} fill className="object-cover" sizes="72px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Pill caractéristique ─────────────────────────────────────────────────────

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl flex-1"
      style={{ background: "#F4EDDF" }}
    >
      <div className="text-vla-orange">{icon}</div>
      <span className="text-xs text-gray-400 font-semibold">{label}</span>
      <span className="text-sm font-black text-vla-black text-center leading-tight">{value}</span>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function VehicleDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const vehicle = getVehicleById(id);
  const { prev, next } = getPrevNextVehicles(id);
  const [modalOpen, setModalOpen] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-vla-beige flex items-center justify-center">
        <div className="text-center">
          <p className="font-black text-2xl text-vla-black mb-2">Véhicule introuvable</p>
          <Link href="/acheter" className="text-vla-orange font-bold underline">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vla-beige">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-sm font-semibold mb-8 text-gray-400">
          <Link href="/" className="hover:text-vla-orange transition-colors">Accueil</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          <Link href="/acheter" className="hover:text-vla-orange transition-colors">Acheter</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          <span className="text-vla-black font-black">{vehicle.marque} {vehicle.modele}</span>
        </nav>

        {/* ── Layout principal ── */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Colonne gauche : galerie + détails */}
          <div className="lg:col-span-3">
            <Gallery images={vehicle.images} title={`${vehicle.marque} ${vehicle.modele}`} />

            {/* Description */}
            {vehicle.description && (
              <div className="mt-8">
                <h2 className="font-black text-xl text-vla-black mb-3">Description</h2>
                <p className="text-sm md:text-base text-gray-500 font-semibold leading-relaxed">
                  {vehicle.description}
                </p>
              </div>
            )}

            {/* Caractéristiques techniques */}
            <div className="mt-8">
              <h2 className="font-black text-xl text-vla-black mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Marque", value: vehicle.marque },
                  { label: "Modèle", value: vehicle.modele },
                  { label: "Année", value: String(vehicle.annee) },
                  { label: "Kilométrage", value: `${vehicle.kilometrage.toLocaleString("fr-FR")} km` },
                  { label: "Carburant", value: vehicle.carburant },
                  { label: "Boîte", value: vehicle.boite },
                  ...(vehicle.puissance ? [{ label: "Puissance", value: vehicle.puissance }] : []),
                  ...(vehicle.couleur ? [{ label: "Couleur", value: vehicle.couleur }] : []),
                  ...(vehicle.portes ? [{ label: "Portes", value: `${vehicle.portes} portes` }] : []),
                  ...(vehicle.places ? [{ label: "Places", value: `${vehicle.places} places` }] : []),
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  >
                    <span className="text-xs font-black uppercase tracking-wider text-gray-400">{item.label}</span>
                    <span className="text-sm font-black text-vla-black">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Options */}
            {vehicle.options && vehicle.options.length > 0 && (
              <div className="mt-8">
                <h2 className="font-black text-xl text-vla-black mb-4">Équipements & options</h2>
                <div className="flex flex-wrap gap-2">
                  {vehicle.options.map((opt) => (
                    <span
                      key={opt}
                      className="text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
                      style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite : prix + CTA (sticky) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 flex flex-col gap-4">
              {/* Carte principale */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "white", boxShadow: "0 4px 40px rgba(0,0,0,0.08)" }}
              >
                {/* Badge */}
                {vehicle.badge && (
                  <span className="inline-block bg-vla-orange text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide mb-4">
                    {vehicle.badge}
                  </span>
                )}

                {/* Titre */}
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-0.5">
                  {vehicle.marque}
                </p>
                <h1 className="font-black text-3xl text-vla-black mb-1">
                  {vehicle.modele}
                </h1>
                <p className="text-sm font-semibold text-gray-400 mb-5">
                  {vehicle.annee} · {vehicle.kilometrage.toLocaleString("fr-FR")} km · {vehicle.carburant}
                </p>

                {/* Prix */}
                <div
                  className="rounded-xl px-5 py-4 mb-5"
                  style={{ background: "rgba(255,134,51,0.07)", border: "1.5px solid rgba(255,134,51,0.2)" }}
                >
                  <p className="text-xs font-black uppercase tracking-widest text-vla-orange mb-0.5">Prix</p>
                  <p className="font-black text-4xl text-vla-black">
                    {vehicle.prix.toLocaleString("fr-FR")}
                    <span className="text-xl text-gray-400 ml-1">€</span>
                  </p>
                </div>

                {/* Pills infos clés */}
                <div className="flex gap-2 mb-6">
                  <InfoPill
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>}
                    label="Année"
                    value={String(vehicle.annee)}
                  />
                  <InfoPill
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>}
                    label="Kilométrage"
                    value={`${vehicle.kilometrage.toLocaleString("fr-FR")} km`}
                  />
                  <InfoPill
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>}
                    label="Boîte"
                    value={vehicle.boite}
                  />
                </div>

                {/* CTA principal */}
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full py-4 rounded-xl font-black text-white text-base mb-3 transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #FF8633 0%, #ff6b00 100%)",
                    boxShadow: "0 6px 24px rgba(255,134,51,0.35)",
                  }}
                >
                  Je suis intéressé(e)
                </button>

                {/* CTA secondaire : Appeler */}
                {!phoneRevealed ? (
                  <button
                    onClick={() => setPhoneRevealed(true)}
                    className="w-full py-3.5 rounded-xl font-black text-vla-orange text-sm border-2 border-vla-orange flex items-center justify-center gap-2 transition-all hover:bg-vla-orange hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 5.9 5.9l.92-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.27 16z" />
                    </svg>
                    Appeler dès maintenant
                  </button>
                ) : (
                  <a
                    href={PHONE_HREF}
                    className="w-full py-3.5 rounded-xl font-black text-white text-sm border-2 border-vla-orange bg-vla-orange flex items-center justify-center gap-2 transition-all hover:bg-opacity-90"
                    style={{ boxShadow: "0 4px 16px rgba(255,134,51,0.25)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 5.9 5.9l.92-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.27 16z" />
                    </svg>
                    {PHONE_NUMBER}
                  </a>
                )}
              </div>

              {/* Navigation prev/next */}
              {(prev || next) && (
                <div className="flex gap-3">
                  {prev && (
                    <Link
                      href={`/acheter/${prev.id}`}
                      className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white font-semibold text-sm text-gray-500 hover:text-vla-orange transition-all group"
                      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                      <span className="truncate">{prev.marque} {prev.modele}</span>
                    </Link>
                  )}
                  {next && (
                    <Link
                      href={`/acheter/${next.id}`}
                      className="flex-1 flex items-center justify-end gap-2 px-4 py-3 rounded-xl bg-white font-semibold text-sm text-gray-500 hover:text-vla-orange transition-all"
                      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                    >
                      <span className="truncate">{next.marque} {next.modele}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky bar mobile ── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 flex gap-3"
        style={{
          background: "rgba(244,237,223,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex flex-col justify-center">
          <p className="text-xs text-gray-400 font-semibold">{vehicle.marque} {vehicle.modele}</p>
          <p className="font-black text-lg text-vla-black leading-none">
            {vehicle.prix.toLocaleString("fr-FR")} €
          </p>
        </div>
        <div className="flex gap-2 flex-1">
          <a
            href={PHONE_HREF}
            className="flex items-center justify-center w-12 h-12 rounded-xl border-2 border-vla-orange flex-shrink-0 transition-all hover:bg-vla-orange hover:text-white"
            style={{ color: "#FF8633" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 5.9 5.9l.92-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.27 16z" />
            </svg>
          </a>
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 py-3 rounded-xl font-black text-white text-sm"
            style={{
              background: "linear-gradient(135deg, #FF8633 0%, #ff6b00 100%)",
              boxShadow: "0 4px 16px rgba(255,134,51,0.3)",
            }}
          >
            Je suis intéressé(e)
          </button>
        </div>
      </div>

      {/* Padding bas pour la sticky bar mobile */}
      <div className="lg:hidden h-20" />

      {/* ── Modal ── */}
      {modalOpen && (
        <ContactModal vehicle={vehicle} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}