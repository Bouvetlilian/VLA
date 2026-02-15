// lib/jwt.ts
// ─────────────────────────────────────────────────────────────────────────────
// Bibliothèque JWT pour l'authentification admin
// Utilise 'jose' (moderne, sécurisé, compatible Edge Runtime)
// ─────────────────────────────────────────────────────────────────────────────

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// ── Types ───────────────────────────────────────────────────────────────────

export interface SessionPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
  twoFactorEnabled: boolean;
  twoFactorVerified: boolean;
  [key: string]: unknown;
}

// ── Constantes ──────────────────────────────────────────────────────────────

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "vla-automobiles-secret-key-change-in-production",
);

const SESSION_DURATION = 24 * 60 * 60; // 24h en secondes
const COOKIE_NAME = "vla_admin_session";

// ── Créer un token JWT ──────────────────────────────────────────────────────

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET_KEY);
}

// ── Vérifier et décoder un token ────────────────────────────────────────────

export async function verifyToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

// ── Créer une session (cookie) ──────────────────────────────────────────────

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await createToken(payload);

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

// ── Récupérer la session depuis le cookie ───────────────────────────────────

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

// ── Détruire la session ─────────────────────────────────────────────────────

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
