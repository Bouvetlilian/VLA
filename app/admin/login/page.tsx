"use client";
// app/admin/login/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Page de connexion administrateur VL Automobiles
// Formulaire email/password + 2FA si activé
// Design minimaliste dans la charte graphique VLA
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token2FA, setToken2FA] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        token2FA: needs2FA ? token2FA : undefined,
        redirect: false,
      });

      if (result?.error) {
        // Si l'erreur est "2FA_REQUIRED", on affiche le champ 2FA
        if (result.error === "2FA_REQUIRED") {
          setNeeds2FA(true);
          setError("");
        } else {
          setError(result.error);
        }
      } else {
        // Connexion réussie
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vla-beige flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <h1 className="font-black text-3xl text-vla-black mb-1">
              VL Automobiles
            </h1>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Back Office
            </p>
          </div>
        </div>

        {/* Card de connexion */}
        <div
          className="bg-white rounded-2xl p-8 shadow-xl"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}
        >
          <h2 className="font-black text-2xl text-vla-black mb-6">
            {needs2FA ? "Code d'authentification" : "Connexion"}
          </h2>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200"
            >
              <p className="text-sm font-bold text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!needs2FA ? (
              <>
                {/* Email */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="admin@vl-automobiles.fr"
                    className="w-full bg-vla-beige border-2 border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-vla-black placeholder-gray-400 outline-none focus:border-vla-orange transition-all"
                    style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04)" }}
                  />
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-vla-beige border-2 border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-vla-black placeholder-gray-400 outline-none focus:border-vla-orange transition-all"
                    style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04)" }}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Code 2FA */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-vla-orange mb-2">
                    Code à 6 chiffres
                  </label>
                  <input
                    type="text"
                    value={token2FA}
                    onChange={(e) => setToken2FA(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    className="w-full bg-vla-beige border-2 border-transparent rounded-xl px-4 py-3 text-center text-2xl font-black text-vla-black placeholder-gray-400 outline-none focus:border-vla-orange transition-all tracking-widest"
                    style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04)" }}
                  />
                  <p className="text-xs text-gray-400 font-semibold mt-2 text-center">
                    Ouvrez votre application Google Authenticator
                  </p>
                </div>

                {/* Bouton retour */}
                <button
                  type="button"
                  onClick={() => {
                    setNeeds2FA(false);
                    setToken2FA("");
                    setError("");
                  }}
                  className="w-full text-sm font-bold text-gray-400 hover:text-vla-orange transition-colors"
                >
                  ← Retour
                </button>
              </>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all duration-200 mt-6"
              style={{
                background: loading ? "#e5e7eb" : "#FF8633",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(255,134,51,0.3)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Connexion...
                </span>
              ) : needs2FA ? (
                "Valider le code"
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 font-semibold mt-6">
          VL Automobiles © {new Date().getFullYear()} — Espace réservé aux administrateurs
        </p>
      </div>
    </div>
  );
}