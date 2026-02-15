// components/admin/AdminHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Header mobile pour le back office admin
// Menu burger + logo + notifications + avatar
// ─────────────────────────────────────────────────────────────────────────────

"use client";

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

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-vla-orange flex items-center justify-center text-white font-black text-xs">
          {userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
      </div>
    </header>
  );
}
