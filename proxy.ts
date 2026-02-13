// middleware.ts
// ─────────────────────────────────────────────────────────────────────────────
// Middleware Next.js — Protection des routes admin
// Redirige vers /admin/login si non authentifié
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: any) => {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAuthenticated = !!req.auth;

  // Si route admin (sauf login) et non authentifié → rediriger vers login
  if (isAdminRoute && !isLoginPage && !isAuthenticated) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si déjà authentifié et sur la page login → rediriger vers dashboard
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

// Configuration : définir les routes où le middleware s'applique
export const config = {
  matcher: [
    "/admin/:path*", // Toutes les routes /admin/*
  ],
};
