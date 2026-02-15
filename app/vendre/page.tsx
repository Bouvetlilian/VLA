"use client";

import { useState, useRef } from "react";
import { createSellLead } from "@/lib/utils/api-client";
import { isValidEmail, isValidPhone } from "@/lib/utils/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step1Data = {
  marque: string;
  modele: string;
  annee: string;
  kilometrage: string;
  carburant: string;
  boite: string;
};

type Step2Data = {
  etat: string;
  carnet: string;
  accident: string;
  commentaire: string;
  photos: File[];
};

type Step3Data = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const MARQUES = [
  "", "Abarth", "Alfa Romeo", "Audi", "BMW", "Citroën", "Dacia", "Fiat",
  "Ford", "Honda", "Hyundai", "Kia", "Mazda", "Mercedes", "MG", "Nissan",
  "Opel", "Peugeot", "Renault", "SEAT", "Skoda", "Suzuki", "Tesla",
  "Toyota", "Volkswagen", "Volvo", "Autre",
];

const ANNEES = ["", ...Array.from({ length: 25 }, (_, i) => String(2025 - i))];
const CARBURANTS = ["", "Essence", "Diesel", "Hybride", "Hybride rechargeable", "Électrique", "GPL"];
const BOITES = ["", "Manuelle", "Automatique"];

const ETATS_OPTIONS = [
  { value: "Excellent", label: "Excellent", desc: "Comme neuf" },
  { value: "Très bon", label: "Très bon", desc: "Quelques traces d'usage" },
  { value: "Bon", label: "Bon", desc: "Usage normal" },
  { value: "Passable", label: "Passable", desc: "Quelques défauts" },
];

const CARNET_OPTIONS = [
  { value: "Complet", label: "Complet" },
  { value: "Partiel", label: "Partiel" },
  { value: "Absent", label: "Absent" },
];

const ACCIDENT_OPTIONS = [
  { value: "Aucun accident", label: "Jamais accidenté" },
  { value: "Accident(s) réparé(s)", label: "Accident(s) réparé(s)" },
  { value: "Je ne sais pas", label: "Je ne sais pas" },
];

const STEPS = [
  { num: 1, label: "Votre véhicule" },
  { num: 2, label: "État & photos" },
  { num: 3, label: "Vos coordonnées" },
];

// ─── Composants UI réutilisables ──────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2">
      {children}
    </label>
  );
}

function Input({
  placeholder,
  value,
  onChange,
  type = "text",
  required,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full bg-vla-beige border-2 border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-vla-black placeholder-gray-400 outline-none focus:border-vla-orange transition-all duration-200"
      style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04)" }}
    />
  );
}

function SelectField({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-vla-beige border-2 border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-vla-black outline-none focus:border-vla-orange transition-all duration-200 pr-10 cursor-pointer"
        style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04)" }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.filter(Boolean).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
          <path d="M1 1L7 7L13 1" stroke="#FF8633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function RadioCard({
  label,
  desc,
  value,
  selected,
  onSelect,
}: {
  label: string;
  desc?: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 cursor-pointer text-left w-full"
      style={{
        borderColor: selected ? "#FF8633" : "transparent",
        background: selected ? "rgba(255,134,51,0.07)" : "#F4EDDF",
        color: selected ? "#FF8633" : "#6b7280",
      }}
    >
      <div className="flex-1">
        <div className="font-bold">{label}</div>
        {desc && <div className="text-xs mt-0.5 opacity-70">{desc}</div>}
      </div>
      {selected && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </button>
  );
}

// ─── Stepper header ───────────────────────────────────────────────────────────

function StepperHeader({ current }: { current: number }) {
  return (
    <div className="mb-10">
      {/* Barre de progression */}
      <div className="relative h-1 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${((current - 1) / (STEPS.length - 1)) * 100}%`,
            background: "linear-gradient(to right, #FF8633, #ffb380)",
            transition: "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>

      {/* Labels étapes */}
      <div className="flex justify-between">
        {STEPS.map((step) => {
          const isDone = step.num < current;
          const isActive = step.num === current;
          return (
            <div key={step.num} className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
                style={{
                  background: isDone || isActive ? "#FF8633" : "#e5e7eb",
                  color: isDone || isActive ? "white" : "#9ca3af",
                  transform: isActive ? "scale(1.15)" : "scale(1)",
                  boxShadow: isActive ? "0 0 0 4px rgba(255,134,51,0.2)" : "none",
                }}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className="text-xs font-bold hidden sm:block"
                style={{ color: isActive ? "#FF8633" : isDone ? "#9ca3af" : "#d1d5db" }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Étape 1 : Véhicule ───────────────────────────────────────────────────────

function Step1({
  data,
  onChange,
  onNext,
}: {
  data: Step1Data;
  onChange: (d: Partial<Step1Data>) => void;
  onNext: () => void;
}) {
  const isValid =
    data.marque && data.modele && data.annee &&
    data.kilometrage && data.carburant && data.boite;

  return (
    <div>
      <h2 className="font-black text-2xl md:text-3xl text-vla-black mb-1">
        Votre véhicule
      </h2>
      <p className="text-sm text-gray-400 font-semibold mb-8">
        Quelques informations de base pour estimer votre véhicule.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <FieldLabel>Marque *</FieldLabel>
          <SelectField placeholder="Sélectionner" value={data.marque} options={MARQUES} onChange={(v) => onChange({ marque: v })} />
        </div>
        <div>
          <FieldLabel>Modèle *</FieldLabel>
          <Input placeholder="Ex : 308, Golf, Clio..." value={data.modele} onChange={(v) => onChange({ modele: v })} />
        </div>
        <div>
          <FieldLabel>Année *</FieldLabel>
          <SelectField placeholder="Sélectionner" value={data.annee} options={ANNEES} onChange={(v) => onChange({ annee: v })} />
        </div>
        <div>
          <FieldLabel>Kilométrage *</FieldLabel>
          <Input placeholder="Ex : 45000" value={data.kilometrage} type="number" onChange={(v) => onChange({ kilometrage: v })} />
        </div>
        <div>
          <FieldLabel>Carburant *</FieldLabel>
          <SelectField placeholder="Sélectionner" value={data.carburant} options={CARBURANTS} onChange={(v) => onChange({ carburant: v })} />
        </div>
        <div>
          <FieldLabel>Boîte de vitesse *</FieldLabel>
          <SelectField placeholder="Sélectionner" value={data.boite} options={BOITES} onChange={(v) => onChange({ boite: v })} />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex items-center gap-2 px-8 py-3.5 rounded-full font-black text-sm transition-all duration-200"
          style={{
            background: isValid ? "#FF8633" : "#e5e7eb",
            color: isValid ? "white" : "#9ca3af",
            cursor: isValid ? "pointer" : "not-allowed",
            boxShadow: isValid ? "0 4px 20px rgba(255,134,51,0.3)" : "none",
          }}
        >
          Continuer
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Étape 2 : État & photos ──────────────────────────────────────────────────

function Step2({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: Step2Data;
  onChange: (d: Partial<Step2Data>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isValid = data.etat && data.carnet && data.accident;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos = Array.from(files).slice(0, 8 - data.photos.length);
    onChange({ photos: [...data.photos, ...newPhotos] });
  };

  const removePhoto = (index: number) => {
    onChange({ photos: data.photos.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <h2 className="font-black text-2xl md:text-3xl text-vla-black mb-1">
        État du véhicule
      </h2>
      <p className="text-sm text-gray-400 font-semibold mb-8">
        Ces informations nous aident à affiner notre estimation.
      </p>

      {/* État général */}
      <div className="mb-6">
        <FieldLabel>État général *</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ETATS_OPTIONS.map((option) => (
            <RadioCard
              key={option.value}
              label={option.label}
              desc={option.desc}
              value={option.value}
              selected={data.etat === option.value}
              onSelect={() => onChange({ etat: option.value })}
            />
          ))}
        </div>
      </div>

      {/* Carnet d'entretien */}
      <div className="mb-6">
        <FieldLabel>Carnet d&apos;entretien *</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CARNET_OPTIONS.map((option) => (
            <RadioCard
              key={option.value}
              label={option.label}
              value={option.value}
              selected={data.carnet === option.value}
              onSelect={() => onChange({ carnet: option.value })}
            />
          ))}
        </div>
      </div>

      {/* Historique accidents */}
      <div className="mb-6">
        <FieldLabel>Historique d&apos;accident *</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ACCIDENT_OPTIONS.map((option) => (
            <RadioCard
              key={option.value}
              label={option.label}
              value={option.value}
              selected={data.accident === option.value}
              onSelect={() => onChange({ accident: option.value })}
            />
          ))}
        </div>
      </div>

      {/* Commentaire */}
      <div className="mb-6">
        <FieldLabel>Commentaire additionnel (optionnel)</FieldLabel>
        <textarea
          value={data.commentaire}
          onChange={(e) => onChange({ commentaire: e.target.value })}
          placeholder="Précisions, défauts, travaux récents..."
          className="w-full bg-vla-beige border-2 border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-vla-black placeholder-gray-400 outline-none focus:border-vla-orange transition-all duration-200 resize-none"
          style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04)" }}
          rows={4}
          maxLength={2000}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{data.commentaire.length} / 2000</p>
      </div>

      {/* Upload photos */}
      <div className="mb-8">
        <FieldLabel>Photos du véhicule (optionnel, max 8)</FieldLabel>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-vla-orange hover:bg-vla-beige/30 transition-all"
        >
          <div className="text-4xl mb-2">📸</div>
          <p className="font-bold text-vla-black mb-1">Cliquez pour ajouter des photos</p>
          <p className="text-sm text-gray-400">Formats acceptés : JPG, PNG (max 5 Mo par photo)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {/* Preview photos */}
        {data.photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {data.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-gray-400 hover:text-vla-orange transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex items-center gap-2 px-8 py-3.5 rounded-full font-black text-sm transition-all duration-200"
          style={{
            background: isValid ? "#FF8633" : "#e5e7eb",
            color: isValid ? "white" : "#9ca3af",
            cursor: isValid ? "pointer" : "not-allowed",
            boxShadow: isValid ? "0 4px 20px rgba(255,134,51,0.3)" : "none",
          }}
        >
          Continuer
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Étape 3 : Coordonnées ────────────────────────────────────────────────────

function Step3({
  data,
  step1Data,
  onChange,
  onBack,
  onSubmit,
  loading,
  error,
}: {
  data: Step3Data;
  step1Data: Step1Data;
  onChange: (d: Partial<Step3Data>) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}) {
  const isValid =
    data.prenom &&
    data.nom &&
    isValidEmail(data.email) &&
    isValidPhone(data.telephone);

  return (
    <div>
      <h2 className="font-black text-2xl md:text-3xl text-vla-black mb-1">
        Vos coordonnées
      </h2>
      <p className="text-sm text-gray-400 font-semibold mb-8">
        Dernière étape pour recevoir votre estimation gratuite.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div>
          <FieldLabel>Prénom *</FieldLabel>
          <Input
            placeholder="Votre prénom"
            value={data.prenom}
            onChange={(v) => onChange({ prenom: v })}
            required
          />
        </div>
        <div>
          <FieldLabel>Nom *</FieldLabel>
          <Input
            placeholder="Votre nom"
            value={data.nom}
            onChange={(v) => onChange({ nom: v })}
            required
          />
        </div>
        <div>
          <FieldLabel>Email *</FieldLabel>
          <Input
            placeholder="votre@email.fr"
            value={data.email}
            onChange={(v) => onChange({ email: v })}
            type="email"
            required
          />
        </div>
        <div>
          <FieldLabel>Téléphone *</FieldLabel>
          <Input
            placeholder="06 12 34 56 78"
            value={data.telephone}
            onChange={(v) => onChange({ telephone: v })}
            type="tel"
            required
          />
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="bg-vla-beige rounded-xl p-6 mb-8">
        <h3 className="font-black text-lg text-vla-black mb-3">Récapitulatif</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 font-semibold">Véhicule</p>
            <p className="font-bold text-vla-black">{step1Data.marque} {step1Data.modele}</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">Année</p>
            <p className="font-bold text-vla-black">{step1Data.annee}</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">Kilométrage</p>
            <p className="font-bold text-vla-black">{Number(step1Data.kilometrage).toLocaleString("fr-FR")} km</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">Carburant</p>
            <p className="font-bold text-vla-black">{step1Data.carburant}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold mb-6">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-gray-400 hover:text-vla-orange transition-colors disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid || loading}
          className="flex items-center gap-2 px-8 py-3.5 rounded-full font-black text-sm transition-all duration-200"
          style={{
            background: isValid && !loading ? "#FF8633" : "#e5e7eb",
            color: isValid && !loading ? "white" : "#9ca3af",
            cursor: isValid && !loading ? "pointer" : "not-allowed",
            boxShadow: isValid && !loading ? "0 4px 20px rgba(255,134,51,0.3)" : "none",
          }}
        >
          {loading ? "Envoi en cours..." : "Envoyer ma demande"}
          {!loading && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Page finale de confirmation ──────────────────────────────────────────────

function SuccessPage() {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h2 className="font-black text-3xl md:text-4xl text-vla-black mb-4">
        Demande envoyée avec succès !
      </h2>
      <p className="text-lg text-gray-500 font-semibold mb-8 max-w-lg mx-auto">
        Nous avons bien reçu votre demande d&apos;estimation. Un conseiller vous recontactera dans les plus brefs délais.
      </p>
      <a
        href="/acheter"
        className="inline-flex items-center gap-2 bg-vla-orange text-white font-black px-8 py-4 rounded-full hover:bg-opacity-90 transition-all"
      >
        Découvrir nos véhicules
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function VendrePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [step1, setStep1] = useState<Step1Data>({
    marque: "",
    modele: "",
    annee: "",
    kilometrage: "",
    carburant: "",
    boite: "",
  });

  const [step2, setStep2] = useState<Step2Data>({
    etat: "",
    carnet: "",
    accident: "",
    commentaire: "",
    photos: [],
  });

  const [step3, setStep3] = useState<Step3Data>({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
  });

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    const result = await createSellLead(
      {
        marque: step1.marque,
        modele: step1.modele,
        annee: Number(step1.annee),
        kilometrage: Number(step1.kilometrage),
        carburant: step1.carburant,
        boite: step1.boite,
        etat: step2.etat,
        carnet: step2.carnet,
        accident: step2.accident,
        commentaire: step2.commentaire,
        prenom: step3.prenom,
        nom: step3.nom,
        email: step3.email,
        telephone: step3.telephone,
      },
      step2.photos
    );

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-vla-beige flex items-center justify-center px-6">
        <div className="max-w-3xl w-full">
          <SuccessPage />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vla-beige">
      <div className="px-6 md:px-12 py-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-black text-4xl md:text-6xl text-vla-black leading-tight mb-3">
            Vendez votre<br />
            <span className="text-vla-orange">véhicule facilement</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 font-semibold">
            Estimation gratuite et sans engagement en 3 étapes
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-3xl p-8 md:p-12" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.07)" }}>
          <StepperHeader current={currentStep} />

          {currentStep === 1 && (
            <Step1
              data={step1}
              onChange={(d) => setStep1({ ...step1, ...d })}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2
              data={step2}
              onChange={(d) => setStep2({ ...step2, ...d })}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3
              data={step3}
              step1Data={step1}
              onChange={(d) => setStep3({ ...step3, ...d })}
              onBack={() => setCurrentStep(2)}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          )}
        </div>

        {/* Sidebar avantages (optionnel) */}
        <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 w-64">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <h3 className="font-black text-lg text-vla-black mb-4">Pourquoi VL Automobiles ?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-vla-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p className="text-gray-600 font-semibold">Estimation gratuite en 24h</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-vla-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p className="text-gray-600 font-semibold">Paiement immédiat</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-vla-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p className="text-gray-600 font-semibold">Reprise garantie</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-vla-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <p className="text-gray-600 font-semibold">Démarches administratives prises en charge</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
