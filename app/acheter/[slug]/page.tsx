"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchVehicleBySlug, createBuyLead } from "@/lib/utils/api-client";
import { formatPrice, formatKilometrage, isValidPhone } from "@/lib/utils/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type Vehicle = {
  id: number;
  slug: string;
  marque: string;
  modele: string;
  annee: number;
  version: string | null;
  kilometrage: number;
  prix: number;
  carburant: string;
  boite: string;
  puissance: string;
  couleur: string;
  portes: number;
  places: number;
  description: string;
  options: string[];
  badge: string | null;
  featured: boolean;
  images: Array<{
    url: string;
    alt: string | null;
    position: number;
    isMain: boolean;
  }>;
};

// ─── Composant Modal Contact ──────────────────────────────────────────────────

function ContactModal({
  vehicle,
  isOpen,
  onClose,
}: {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!prenom || prenom.length < 2) {
      setError("Le prénom doit contenir au moins 2 caractères");
      return;
    }

    if (!isValidPhone(telephone)) {
      setError("Le numéro de téléphone n'est pas valide");
      return;
    }

    setLoading(true);

    const result = await createBuyLead({
      vehicleId: vehicle.id,
      prenom,
      telephone,
      message,
    });

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
      // Fermer après 3 secondes
      setTimeout(() => {
        onClose();
        // Reset
        setPrenom("");
        setTelephone("");
        setMessage("");
        setSubmitted(false);
      }, 3000);
    } else {
      setError(result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="font-black text-2xl text-vla-black mb-2">Demande envoyée !</h3>
            <p className="text-gray-500 font-semibold">
              Nous vous recontacterons rapidement au {telephone}
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-black text-2xl text-vla-black mb-2">
              Intéressé par ce véhicule ?
            </h2>
            <p className="text-gray-500 font-semibold mb-6">
              {vehicle.marque} {vehicle.modele} - {formatPrice(vehicle.prix)}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full px-4 py-3 bg-vla-beige rounded-xl outline-none focus:ring-2 focus:ring-vla-orange transition-all"
                  placeholder="Votre prénom"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-4 py-3 bg-vla-beige rounded-xl outline-none focus:ring-2 focus:ring-vla-orange transition-all"
                  placeholder="06 12 34 56 78"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-vla-beige rounded-xl outline-none focus:ring-2 focus:ring-vla-orange transition-all resize-none"
                  placeholder="Votre message..."
                  rows={4}
                  maxLength={1000}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-vla-orange text-white font-black py-4 rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Envoi en cours..." : "Envoyer ma demande"}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4 font-semibold">
              En soumettant ce formulaire, vous acceptez d&apos;être recontacté par nos équipes.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Galerie
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Téléphone
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    async function loadVehicle() {
      setLoading(true);
      setError(null);

      const result = await fetchVehicleBySlug(slug);

      if (result.success) {
        setVehicle(result.data.vehicle);
      } else {
        setError(result.error);
      }

      setLoading(false);
    }

    loadVehicle();
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-vla-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-vla-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Chargement du véhicule...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-vla-beige flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="font-black text-3xl text-vla-black mb-3">Véhicule introuvable</h1>
          <p className="text-gray-500 font-semibold mb-6">
            {error || "Ce véhicule n'existe pas ou n'est plus disponible."}
          </p>
          <Link
            href="/acheter"
            className="inline-block bg-vla-orange text-white font-bold px-8 py-3 rounded-full hover:bg-opacity-90 transition-all"
          >
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const images = vehicle.images.sort((a, b) => a.position - b.position);
  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-vla-beige">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 pt-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
          <Link href="/" className="hover:text-vla-orange transition-colors">
            Accueil
          </Link>
          <span>›</span>
          <Link href="/acheter" className="hover:text-vla-orange transition-colors">
            Acheter
          </Link>
          <span>›</span>
          <span className="text-vla-black">
            {vehicle.marque} {vehicle.modele}
          </span>
        </div>
      </div>

      <div className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Colonne gauche : Galerie */}
          <div>
            {/* Image principale */}
            <div className="relative bg-white rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: "4/3" }}>
              {currentImage && (
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt || `${vehicle.marque} ${vehicle.modele}`}
                  fill
                  className="object-cover"
                  priority
                />
              )}

              {/* Badge */}
              {vehicle.badge && (
                <div className="absolute top-4 left-4 bg-vla-orange text-white px-4 py-2 rounded-full font-black text-sm">
                  {vehicle.badge}
                </div>
              )}

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white transition-all flex items-center justify-center shadow-lg"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white transition-all flex items-center justify-center shadow-lg"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>

                  {/* Indicateur */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={img.position}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative rounded-lg overflow-hidden ${
                      index === currentImageIndex ? "ring-4 ring-vla-orange" : ""
                    }`}
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Colonne droite : Infos */}
          <div>
            <div className="bg-white rounded-2xl p-8" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.07)" }}>
              {/* Titre */}
              <h1 className="font-black text-3xl md:text-4xl text-vla-black mb-2">
                {vehicle.marque} {vehicle.modele}
              </h1>
              {vehicle.version && (
                <p className="text-gray-500 font-semibold mb-4">{vehicle.version}</p>
              )}

              {/* Prix */}
              <div className="text-5xl font-black text-vla-orange mb-6">
                {formatPrice(vehicle.prix)}
              </div>

              {/* Caractéristiques pills */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-vla-beige px-4 py-2 rounded-full text-sm font-bold text-vla-black">
                  {formatKilometrage(vehicle.kilometrage)}
                </div>
                <div className="bg-vla-beige px-4 py-2 rounded-full text-sm font-bold text-vla-black">
                  {vehicle.annee}
                </div>
                <div className="bg-vla-beige px-4 py-2 rounded-full text-sm font-bold text-vla-black">
                  {vehicle.carburant}
                </div>
                <div className="bg-vla-beige px-4 py-2 rounded-full text-sm font-bold text-vla-black">
                  {vehicle.boite}
                </div>
              </div>

              {/* Détails techniques */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Puissance</p>
                  <p className="font-bold text-vla-black">{vehicle.puissance}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Couleur</p>
                  <p className="font-bold text-vla-black">{vehicle.couleur}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Portes</p>
                  <p className="font-bold text-vla-black">{vehicle.portes}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Places</p>
                  <p className="font-bold text-vla-black">{vehicle.places}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-vla-orange text-white font-black py-4 rounded-xl hover:bg-opacity-90 transition-all"
                >
                  Je suis intéressé
                </button>
                <button
                  onClick={() => setShowPhone(true)}
                  className="w-full border-2 border-vla-orange text-vla-orange font-bold py-4 rounded-xl hover:bg-vla-orange hover:text-white transition-all"
                >
                  {showPhone ? "06 12 34 56 78" : "Afficher le numéro"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 bg-white rounded-2xl p-8" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.07)" }}>
          <h2 className="font-black text-2xl text-vla-black mb-4">Description</h2>
          <p className="text-gray-600 font-semibold leading-relaxed whitespace-pre-line">
            {vehicle.description}
          </p>
        </div>

        {/* Options */}
        {vehicle.options.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-8" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.07)" }}>
            <h2 className="font-black text-2xl text-vla-black mb-4">Options et équipements</h2>
            <div className="flex flex-wrap gap-2">
              {vehicle.options.map((option, index) => (
                <div
                  key={index}
                  className="bg-vla-beige text-vla-black px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Contact */}
      <ContactModal vehicle={vehicle} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
