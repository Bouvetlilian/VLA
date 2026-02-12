// middleware.ts
// ─────────────────────────────────────────────────────────────────────────────
// Middleware Next.js — Protection des routes /admin avec JWT custom
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si la route commence par /admin (sauf /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Récupérer le cookie de session
    const token = request.cookies.get("vla_admin_session")?.value;

    // Si pas de token = pas authentifié
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Vérifier le token
    const session = await verifyToken(token);

    if (!session) {
      // Token invalide ou expiré
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Si 2FA activé mais pas vérifié
    if (session.twoFactorEnabled && !session.twoFactorVerified) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images/).*)",
  ],
};