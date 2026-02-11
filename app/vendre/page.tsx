"use client";

import { useState, useRef } from "react";

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
  photos: File[];
};

type Step3Data = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  message: string;
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
const ETATS = ["", "Excellent", "Très bon", "Bon", "Passable", "À rénover"];

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
  value,
  selected,
  onSelect,
  icon,
}: {
  label: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 cursor-pointer"
      style={{
        borderColor: selected ? "#FF8633" : "transparent",
        background: selected ? "rgba(255,134,51,0.07)" : "#F4EDDF",
        color: selected ? "#FF8633" : "#6b7280",
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
      {selected && (
        <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
    const newFiles = Array.from(files).slice(0, 8 - data.photos.length);
    onChange({ photos: [...data.photos, ...newFiles] });
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
        Ces informations nous permettent d&apos;affiner notre estimation.
      </p>

      {/* État général */}
      <div className="mb-6">
        <FieldLabel>État général *</FieldLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ETATS.filter(Boolean).map((e) => (
            <RadioCard
              key={e}
              label={e}
              value={e}
              selected={data.etat === e}
              onSelect={() => onChange({ etat: e })}
            />
          ))}
        </div>
      </div>

      {/* Carnet d'entretien */}
      <div className="mb-6">
        <FieldLabel>Carnet d&apos;entretien *</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {["Complet", "Incomplet", "Absent", "Non applicable"].map((opt) => (
            <RadioCard
              key={opt}
              label={opt}
              value={opt}
              selected={data.carnet === opt}
              onSelect={() => onChange({ carnet: opt })}
            />
          ))}
        </div>
      </div>

      {/* Accident */}
      <div className="mb-6">
        <FieldLabel>Historique d&apos;accident *</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {["Aucun accident", "Accident(s) réparé(s)", "Je ne sais pas"].map((opt) => (
            <RadioCard
              key={opt}
              label={opt}
              value={opt}
              selected={data.accident === opt}
              onSelect={() => onChange({ accident: opt })}
            />
          ))}
        </div>
      </div>

      {/* Upload photos */}
      <div className="mb-8">
        <FieldLabel>Photos du véhicule <span className="text-gray-400 normal-case tracking-normal font-semibold">(optionnel — 8 max)</span></FieldLabel>

        {/* Zone de drop */}
        <div
          className="relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 hover:border-vla-orange group"
          style={{ borderColor: "#d1d5db", background: "#faf8f4" }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-colors"
              style={{ background: "rgba(255,134,51,0.1)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-500 group-hover:text-vla-orange transition-colors">
              Glissez vos photos ici ou <span className="text-vla-orange">parcourez</span>
            </p>
            <p className="text-xs text-gray-400">JPG, PNG, WEBP — {data.photos.length}/8 photos</p>
          </div>
        </div>

        {/* Aperçu photos */}
        {data.photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {data.photos.map((file, i) => (
              <div key={i} className="relative group/photo aspect-square rounded-xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={`photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3.5 rounded-full font-black text-sm text-gray-400 hover:text-vla-black transition-colors"
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
  step1,
  onChange,
  onSubmit,
  onBack,
  submitting,
}: {
  data: Step3Data;
  step1: Step1Data;
  onChange: (d: Partial<Step3Data>) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const isValid = data.prenom && data.nom && data.email && data.telephone;

  return (
    <div>
      <h2 className="font-black text-2xl md:text-3xl text-vla-black mb-1">
        Vos coordonnées
      </h2>
      <p className="text-sm text-gray-400 font-semibold mb-8">
        On vous recontacte sous 24h avec notre estimation gratuite.
      </p>

      {/* Récapitulatif véhicule */}
      <div
        className="rounded-2xl p-4 mb-8 flex flex-wrap gap-3"
        style={{ background: "rgba(255,134,51,0.07)", border: "1.5px solid rgba(255,134,51,0.2)" }}
      >
        <span className="text-xs font-black uppercase tracking-widest text-vla-orange mr-1">Votre véhicule :</span>
        {[
          `${step1.marque} ${step1.modele}`,
          step1.annee,
          `${Number(step1.kilometrage).toLocaleString("fr-FR")} km`,
          step1.carburant,
          step1.boite,
        ].map((item) => (
          <span
            key={item}
            className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-vla-black"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <FieldLabel>Prénom *</FieldLabel>
          <Input placeholder="Votre prénom" value={data.prenom} onChange={(v) => onChange({ prenom: v })} />
        </div>
        <div>
          <FieldLabel>Nom *</FieldLabel>
          <Input placeholder="Votre nom" value={data.nom} onChange={(v) => onChange({ nom: v })} />
        </div>
        <div>
          <FieldLabel>Email *</FieldLabel>
          <Input placeholder="votre@email.com" value={data.email} type="email" onChange={(v) => onChange({ email: v })} />
        </div>
        <div>
          <FieldLabel>Téléphone *</FieldLabel>
          <Input placeholder="06 XX XX XX XX" value={data.telephone} type="tel" onChange={(v) => onChange({ telephone: v })} />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Message <span className="text-gray-400 normal-case tracking-normal font-semibold">(optionnel)</span></FieldLabel>
          <textarea
            placeholder="Informations complémentaires sur votre véhicule..."
            value={data.message}
            onChange={(e) => onChange({ message: e.target.value })}
            rows={3}
            className="w-full bg-vla-beige border-2 border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-vla-black placeholder-gray-400 outline-none focus:border-vla-orange transition-all duration-200 resize-none"
            style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04)" }}
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3.5 rounded-full font-black text-sm text-gray-400 hover:text-vla-black transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid || submitting}
          className="flex items-center gap-2 px-8 py-3.5 rounded-full font-black text-sm transition-all duration-200"
          style={{
            background: isValid && !submitting ? "#FF8633" : "#e5e7eb",
            color: isValid && !submitting ? "white" : "#9ca3af",
            cursor: isValid && !submitting ? "pointer" : "not-allowed",
            boxShadow: isValid && !submitting ? "0 4px 20px rgba(255,134,51,0.3)" : "none",
          }}
        >
          {submitting ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Envoi en cours...
            </>
          ) : (
            <>
              Envoyer ma demande
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Écran de confirmation ────────────────────────────────────────────────────

function Confirmation({ prenom, onReset }: { prenom: string; onReset: () => void }) {
  return (
    <div className="text-center py-8">
      {/* Icône animée */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{
          background: "rgba(255,134,51,0.1)",
          animation: "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF8633" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h2 className="font-black text-3xl text-vla-black mb-3">
        Merci {prenom} !
      </h2>
      <p className="text-gray-500 font-semibold text-base mb-2 max-w-sm mx-auto">
        Votre demande a bien été reçue.
      </p>
      <p className="text-gray-400 font-semibold text-sm max-w-sm mx-auto mb-10">
        Valentin ou Lilian vous contactera sous <strong className="text-vla-black">24h ouvrées</strong> avec une estimation gratuite de votre véhicule.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={onReset}
          className="px-7 py-3 rounded-full font-black text-sm border-2 border-vla-orange text-vla-orange hover:bg-vla-orange hover:text-white transition-all"
        >
          Nouvelle demande
        </button>
        <a
          href="/acheter"
          className="px-7 py-3 rounded-full font-black text-sm bg-vla-orange text-white hover:bg-opacity-90 transition-all"
          style={{ boxShadow: "0 4px 20px rgba(255,134,51,0.3)" }}
        >
          Voir nos véhicules
        </a>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function VendrePage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [step1, setStep1] = useState<Step1Data>({
    marque: "", modele: "", annee: "", kilometrage: "", carburant: "", boite: "",
  });
  const [step2, setStep2] = useState<Step2Data>({
    etat: "", carnet: "", accident: "", photos: [],
  });
  const [step3, setStep3] = useState<Step3Data>({
    prenom: "", nom: "", email: "", telephone: "", message: "",
  });

  const handleSubmit = () => {
    setSubmitting(true);
    // Simulation envoi — à remplacer par un appel API réel
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleReset = () => {
    setStep(1);
    setSubmitted(false);
    setStep1({ marque: "", modele: "", annee: "", kilometrage: "", carburant: "", boite: "" });
    setStep2({ etat: "", carnet: "", accident: "", photos: [] });
    setStep3({ prenom: "", nom: "", email: "", telephone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-vla-beige">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* ── Hero ── */}
        <div className="pt-10 pb-8">
          <h1 className="font-black text-4xl md:text-6xl text-vla-black leading-tight mb-2">
            Vendez votre véhicule<br />
            <span className="text-vla-orange">en toute sérénité</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 font-semibold">
            Estimation gratuite sous 24h — aucun engagement
          </p>
        </div>

        {/* ── Layout deux colonnes ── */}
        <div className="grid lg:grid-cols-3 gap-8 pb-20">

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl p-7 md:p-10"
              style={{ background: "white", boxShadow: "0 4px 40px rgba(0,0,0,0.07)" }}
            >
              {submitted ? (
                <Confirmation prenom={step3.prenom} onReset={handleReset} />
              ) : (
                <>
                  <StepperHeader current={step} />
                  {step === 1 && (
                    <Step1 data={step1} onChange={(d) => setStep1((p) => ({ ...p, ...d }))} onNext={() => setStep(2)} />
                  )}
                  {step === 2 && (
                    <Step2 data={step2} onChange={(d) => setStep2((p) => ({ ...p, ...d }))} onNext={() => setStep(3)} onBack={() => setStep(1)} />
                  )}
                  {step === 3 && (
                    <Step3 data={step3} step1={step1} onChange={(d) => setStep3((p) => ({ ...p, ...d }))} onSubmit={handleSubmit} onBack={() => setStep(2)} submitting={submitting} />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar avantages */}
          <div className="hidden lg:flex flex-col gap-4">
            <div
              className="rounded-2xl p-6"
              style={{ background: "white", boxShadow: "0 4px 40px rgba(0,0,0,0.07)" }}
            >
              <h3 className="font-black text-base text-vla-black mb-5">
                Pourquoi passer par VL Automobiles ?
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { icon: "⚡", title: "Réponse rapide", desc: "Estimation sous 24h ouvrées, sans engagement." },
                  { icon: "💰", title: "Meilleur prix", desc: "On négocie pour vous obtenir le meilleur prix du marché." },
                  { icon: "🔒", title: "Zéro tracas", desc: "On gère toutes les démarches administratives." },
                  { icon: "🤝", title: "Suivi personnalisé", desc: "Un interlocuteur unique de A à Z." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: "rgba(255,134,51,0.1)" }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-black text-sm text-vla-black">{item.title}</p>
                      <p className="text-xs text-gray-400 font-semibold leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge de confiance */}
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                background: "linear-gradient(135deg, #FF8633 0%, #ff6b00 100%)",
                boxShadow: "0 8px 30px rgba(255,134,51,0.3)",
              }}
            >
              <p className="font-black text-white text-2xl mb-0.5">+200</p>
              <p className="text-white text-xs font-bold opacity-80">véhicules vendus</p>
              <div className="h-px bg-white my-3 opacity-20" />
              <p className="font-black text-white text-2xl mb-0.5">4.9 / 5</p>
              <p className="text-white text-xs font-bold opacity-80">satisfaction client</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}