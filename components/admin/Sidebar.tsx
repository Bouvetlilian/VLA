// components/admin/Sidebar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Sidebar de navigation pour le back office admin
// Support des sous-menus dépliables
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

type SubNavItem = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: SubNavItem[];
};

type SidebarProps = {
  userName: string;
  userEmail: string;
  userRole: string;
  newLeadsCount?: number;
};

export default function Sidebar({
  userName,
  userEmail,
  userRole,
  newLeadsCount = 0,
}: SidebarProps) {
  const pathname = usePathname();

  // Sections ouvertes (par href parent)
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Ouvrir automatiquement la section active au chargement
  useEffect(() => {
    const navItems = getNavItems(newLeadsCount);
    navItems.forEach((item) => {
      if (item.children && pathname.startsWith(item.href)) {
        setOpenSections((prev) =>
          prev.includes(item.href) ? prev : [...prev, item.href]
        );
      }
    });
  }, [pathname, newLeadsCount]);

  const toggleSection = (href: string) => {
    setOpenSections((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href;
  };

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return pathname.startsWith(item.href);
    }
    return isActive(item.href);
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <div className="text-center">
          <h1 className="font-black text-xl text-vla-black">VL Automobiles</h1>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Back Office
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {getNavItems(newLeadsCount).map((item) => {
          const parentActive = isParentActive(item);
          const isOpen = openSections.includes(item.href);
          const hasChildren = item.children && item.children.length > 0;

          if (hasChildren) {
            return (
              <div key={item.href}>
                {/* Bouton parent dépliable */}
                <button
                  onClick={() => toggleSection(item.href)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all
                    ${
                      parentActive
                        ? "bg-vla-orange text-white"
                        : "text-gray-600 hover:bg-vla-beige hover:text-vla-orange"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>

                  {/* Chevron */}
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Sous-menu */}
                {isOpen && (
                  <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
                    {/* Lien vers la page principale (ex: /admin/rachat) */}
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs transition-all
                        ${
                          pathname === item.href
                            ? "bg-orange-50 text-vla-orange"
                            : "text-gray-500 hover:text-vla-orange hover:bg-orange-50"
                        }
                      `}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Nouvelle cotation
                    </Link>

                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs transition-all
                          ${
                            isActive(child.href)
                              ? "bg-orange-50 text-vla-orange"
                              : "text-gray-500 hover:text-vla-orange hover:bg-orange-50"
                          }
                        `}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Lien simple (sans sous-menu)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all
                ${
                  isActive(item.href)
                    ? "bg-vla-orange text-white"
                    : "text-gray-600 hover:bg-vla-beige hover:text-vla-orange"
                }
              `}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    isActive(item.href)
                      ? "bg-white text-vla-orange"
                      : "bg-vla-orange text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profil utilisateur */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-vla-orange flex items-center justify-center text-white font-black text-sm">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-vla-black truncate">{userName}</p>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>

        <div className="mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-vla-beige text-vla-orange">
            {userRole === "SUPER_ADMIN" ? "Super Admin" : "Administrateur"}
          </span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full px-4 py-2 rounded-xl font-semibold text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Définition des items de navigation (extraite pour lisibilité)
// ─────────────────────────────────────────────────────────────────────────────

function getNavItems(newLeadsCount: number): NavItem[] {
  return [
    {
      label: "Dashboard",
      href: "/admin",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Véhicules",
      href: "/admin/vehicles",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label: "Statistiques",
      href: "/admin/stats",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: "Leads",
      href: "/admin/leads/buy",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badge: newLeadsCount > 0 ? newLeadsCount : undefined,
    },
    {
      label: "Cotation rachat",
      href: "/admin/rachat",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      children: [
        {
          label: "Historique cotations",
          href: "/admin/rachat/historique",
        },
      ],
    },
    {
      label: "Paramètres",
      href: "/admin/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];
}