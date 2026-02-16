// components/admin/AdminHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Header mobile pour le back office admin
// Menu burger + logo + notifications + avatar + déconnexion
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

type AdminHeaderProps = {
  userName: string;
  newLeadsCount?: number;
  onMenuClick: () => void;
};

export default function AdminHeader({
  userName,
  newLeadsCount = 0,
  onMenuClick,
}: AdminHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:hidden">
      {/* Menu burger */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl hover:bg-vla-beige transition-colors"
        aria-label="Ouvrir le menu"
      >
        <svg
          className="w-6 h-6 text-vla-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Logo */}
      <div className="text-center">
        <h1 className="font-black text-lg text-vla-black">VL Automobiles</h1>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Admin
        </p>
      </div>

      {/* Notifications + Avatar */}
      <div className="flex items-center gap-2">
        {/* Cloche notifications */}
        {newLeadsCount > 0 && (
          <button
            className="relative p-2 rounded-xl hover:bg-vla-beige transition-colors"
            aria-label="Notifications"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-vla-orange rounded-full" />
          </button>
        )}

        {/* Avatar avec dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full bg-vla-orange flex items-center justify-center text-white font-black text-xs hover:bg-opacity-90 transition-all"
          >
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <>
              {/* Overlay pour fermer le dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-vla-black">
                    {userName}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}