// middleware.ts
// ─────────────────────────────────────────────────────────────────────────────
// Middleware Next.js — Version simplifiée sans NextAuth auth()
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si la route commence par /admin (sauf /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Récupérer le token JWT
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Si pas de token = pas authentifié
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Si 2FA activé mais pas vérifié
    if (token.twoFactorEnabled && !token.twoFactorVerified) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api(?!/admin)|_next/static|_next/image|favicon.ico|images/).*)",
  ],
};