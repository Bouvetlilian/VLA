// app/admin/layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Layout du back office administrateur
// Sidebar desktop (260px) + Header mobile avec overlay
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  // Redirection si non authentifié
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/admin/login");
    }
  }, [status]);

  // Récupérer le compteur de nouveaux leads (sera implémenté avec l'API)
  useEffect(() => {
    // TODO: Appeler l'API pour récupérer le nombre de leads NEW
    // const fetchNewLeadsCount = async () => {
    //   const response = await fetch("/api/admin/leads/count?status=NEW");
    //   const data = await response.json();
    //   setNewLeadsCount(data.count);
    // };
    // fetchNewLeadsCount();
  }, []);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-vla-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-vla-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-semibold text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas de session, ne rien afficher (redirect en cours)
  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-vla-beige">
      {/* Sidebar Desktop (cachée sur mobile) */}
      <div className="hidden lg:block">
        <Sidebar
          userName={session.user?.name || "Admin"}
          userEmail={session.user?.email || ""}
          userRole={session.user?.role || "ADMIN"}
          newLeadsCount={newLeadsCount}
        />
      </div>

      {/* Sidebar Mobile (overlay) */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden">
            <Sidebar
              userName={session.user?.name || "Admin"}
              userEmail={session.user?.email || ""}
              userRole={session.user?.role || "ADMIN"}
              newLeadsCount={newLeadsCount}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile */}
        <AdminHeader
          userName={session.user?.name || "Admin"}
          newLeadsCount={newLeadsCount}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}