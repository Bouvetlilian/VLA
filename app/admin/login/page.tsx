"use client";

// app/admin/login/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Page de connexion admin avec support 2FA
// Design minimaliste selon la charte VLA
// ─────────────────────────────────────────────────────────────────────────────

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  // ── États ─────────────────────────────────────────────────────────────────

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showTotpInput, setShowTotpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Soumission du formulaire ──────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        totpCode: showTotpInput ? totpCode : undefined,
        redirect: false,
      });

      if (result?.error) {
        // Si erreur = besoin du code 2FA
        if (result.error === "CredentialsSignin" && !showTotpInput) {
          setShowTotpInput(true);
          setError("");
        } else {
          setError(
            showTotpInput
              ? "Code 2FA invalide"
              : "Email ou mot de passe incorrect"
          );
        }
        setIsLoading(false);
        return;
      }

      // Connexion réussie
      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-vla-beige via-white to-vla-beige flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block relative w-32 h-32 mb-4">
            <Image
              src="/images/logo_vla.png"
              alt="VL Automobiles"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-vla-black tracking-tight">
            Espace administrateur
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Connectez-vous pour accéder au back office
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={showTotpInput}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-vla-orange focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="admin@vl-automobiles.fr"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={showTotpInput}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-vla-orange focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            {/* Code 2FA (affiché uniquement si nécessaire) */}
            {showTotpInput && (
              <div className="pt-4 border-t-2 border-gray-100">
                <div className="bg-vla-beige/30 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-700 text-center">
                    🔐 Double authentification activée
                  </p>
                  <p className="text-xs text-gray-600 text-center mt-1">
                    Ouvrez votre application d'authentification
                  </p>
                </div>

                <label
                  htmlFor="totpCode"
                  className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2"
                >
                  Code 2FA
                </label>
                <input
                  id="totpCode"
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-vla-orange focus:outline-none transition-colors text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowTotpInput(false);
                    setTotpCode("");
                    setError("");
                  }}
                  className="w-full mt-3 text-xs text-gray-600 hover:text-vla-orange transition-colors"
                >
                  ← Retour
                </button>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                <p className="text-sm font-semibold text-red-700 text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-vla-orange hover:bg-orange-600 text-white font-black py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connexion...
                </span>
              ) : showTotpInput ? (
                "Valider le code 2FA"
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        {/* Note de sécurité */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Cette zone est réservée aux administrateurs de VL Automobiles.
          <br />
          Toutes les tentatives de connexion sont enregistrées.
        </p>
      </div>
    </div>
  );
}