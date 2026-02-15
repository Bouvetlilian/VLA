// lib/auth.ts
// ─────────────────────────────────────────────────────────────────────────────
// Configuration NextAuth v5 pour VL Automobiles
// Authentification par email/password + support 2FA (TOTP)
// ─────────────────────────────────────────────────────────────────────────────

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AdminRole } from "@prisma/client";
import * as OTPAuth from "otpauth";

// ── Étendre les types NextAuth pour inclure nos champs custom ────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AdminRole;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
  }

  // Étendre JWT directement ici au lieu d'un module séparé
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
  }
}

// ── Configuration NextAuth ────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // On utilise JWT plutôt que database sessions
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  pages: {
    signIn: "/admin/login", // Page de connexion custom
    error: "/admin/login", // Redirection en cas d'erreur
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        token2FA: { label: "Code 2FA", type: "text", optional: true },
      },
      async authorize(credentials: Record<string, unknown> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        // 1. Vérifier que l'admin existe
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email as string },
        });

        if (!admin) {
          throw new Error("Email ou mot de passe incorrect");
        }

        // 2. Vérifier que le compte est actif
        if (!admin.isActive) {
          throw new Error("Ce compte a été désactivé");
        }

        // 3. Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          admin.password,
        );

        if (!isValidPassword) {
          throw new Error("Email ou mot de passe incorrect");
        }

        // 4. Si 2FA activé, vérifier le token
        if (admin.twoFactorEnabled) {
          if (!credentials.token2FA) {
            // Première étape : password OK, mais on demande le code 2FA
            // On lance une erreur spéciale pour que le frontend sache qu'il faut demander le 2FA
            throw new Error("2FA_REQUIRED");
          }

          // Vérifier le code 2FA (on créera la fonction plus tard)
          const isValid2FA = await verify2FAToken(
            admin.twoFactorSecret!,
            credentials.token2FA as string,
          );

          if (!isValid2FA) {
            throw new Error("Code 2FA incorrect");
          }
        }

        // 5. Mettre à jour la date de dernière connexion
        await prisma.admin.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        // 6. Retourner les infos de l'admin (seront stockées dans le JWT)
        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    // Callback JWT : ajouter les infos custom au token
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },

    // Callback Session : transférer les infos du token vers la session
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
  },
});

// ── Utilitaires 2FA ───────────────────────────────────────────────────────────

/**
 * Vérifie un code TOTP (Google Authenticator)
 * On importera OTPAuth dans le prochain fichier
 */
async function verify2FAToken(
  encryptedSecret: string,
  token: string,
): Promise<boolean> {
  try {
    const crypto = await import("crypto");

    // Déchiffrer le secret TOTP (stocké chiffré en base)
    const algorithm = "aes-256-cbc";
    const key = Buffer.from(process.env.TOTP_ENCRYPTION_KEY!, "base64");

    const [ivHex, encryptedHex] = encryptedSecret.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const secret = decrypted.toString();

    // Vérifier le code TOTP
    const totp = new OTPAuth.TOTP({
      issuer: "VL Automobiles",
      label: "Admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
    });

    // Validation avec fenêtre de tolérance (±1 période = 30s avant/après)
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch (error) {
    console.error("Erreur validation 2FA:", error);
    return false;
  }
}

/**
 * Génère et chiffre un secret TOTP pour un nouvel enrôlement 2FA
 */
export async function generate2FASecret(): Promise<{
  secret: string;
  encryptedSecret: string;
  qrCodeUrl: string;
}> {
  const crypto = await import("crypto");

  // Générer un secret aléatoire
  const secret = new OTPAuth.Secret({ size: 20 });

  // Créer l'objet TOTP
  const totp = new OTPAuth.TOTP({
    issuer: "VL Automobiles",
    label: "Admin",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret,
  });

  // Chiffrer le secret avant stockage
  const algorithm = "aes-256-cbc";
  const key = Buffer.from(process.env.TOTP_ENCRYPTION_KEY!, "base64");
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(secret.base32);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const encryptedSecret = `${iv.toString("hex")}:${encrypted.toString("hex")}`;

  // Générer l'URL pour le QR code
  const qrCodeUrl = totp.toString();

  return {
    secret: secret.base32,
    encryptedSecret,
    qrCodeUrl,
  };
}

/**
 * Helper pour vérifier si l'utilisateur est authentifié
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Non authentifié");
  }
  return session;
}

/**
 * Helper pour vérifier si l'utilisateur est Super Admin
 */
export async function requireSuperAdmin() {
  const session = await requireAuth();
  if (session.user.role !== AdminRole.SUPER_ADMIN) {
    throw new Error("Accès réservé aux Super Admins");
  }
  return session;
}
