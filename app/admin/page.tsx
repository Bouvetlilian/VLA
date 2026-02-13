// app/admin/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Dashboard administrateur VL Automobiles (Version temporaire)
// Page simple pour tester que l'authentification fonctionne
// Sera remplacée par le vrai dashboard avec stats dans la prochaine étape
// ─────────────────────────────────────────────────────────────────────────────

import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-vla-beige">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header temporaire */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-black text-3xl text-vla-black mb-2">
                Bienvenue, {session.user.name} 👋
              </h1>
              <p className="text-sm font-semibold text-gray-400">
                {session.user.email} — {session.user.role}
              </p>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-black text-sm text-gray-400 hover:text-vla-orange hover:bg-vla-beige transition-all"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>

        {/* Card de succès */}
        <div
          className="bg-white rounded-2xl p-8 text-center"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(255,134,51,0.1)" }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF8633"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h2 className="font-black text-2xl text-vla-black mb-3">
            🎉 Authentification fonctionnelle !
          </h2>
          <p className="text-gray-500 font-semibold max-w-md mx-auto mb-6">
            NextAuth est correctement configuré. Le dashboard complet avec les
            statistiques, la gestion des véhicules et des leads sera créé dans
            la prochaine étape.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-vla-beige rounded-xl p-4">
              <p className="text-xs font-black uppercase tracking-widest text-vla-orange mb-1">
                Prochaine étape
              </p>
              <p className="font-black text-lg text-vla-black">
                API Routes
              </p>
            </div>
            <div className="bg-vla-beige rounded-xl p-4">
              <p className="text-xs font-black uppercase tracking-widest text-vla-orange mb-1">
                Puis
              </p>
              <p className="font-black text-lg text-vla-black">
                Interface Admin
              </p>
            </div>
            <div className="bg-vla-beige rounded-xl p-4">
              <p className="text-xs font-black uppercase tracking-widest text-vla-orange mb-1">
                Enfin
              </p>
              <p className="font-black text-lg text-vla-black">
                Notifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}