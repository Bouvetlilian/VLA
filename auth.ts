// auth.ts
// ─────────────────────────────────────────────────────────────────────────────
// Configuration NextAuth.js v5 — Version compatible Next.js 14
// ─────────────────────────────────────────────────────────────────────────────

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// ── Types étendus ───────────────────────────────────────────────────────────

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    twoFactorEnabled: boolean;
    twoFactorVerified?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      twoFactorEnabled: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: string;
    twoFactorEnabled: boolean;
    twoFactorVerified?: boolean;
  }
}

// ── Configuration ───────────────────────────────────────────────────────────

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "Code 2FA", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. Récupérer l'admin
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email as string },
        });

        if (!admin || !admin.isActive) {
          return null;
        }

        // 2. Vérifier le password
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          admin.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // 3. Si 2FA activé, vérifier le code
        if (admin.twoFactorEnabled) {
          if (!credentials.totpCode) {
            // Retourner un user avec flag non vérifié
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role,
              twoFactorEnabled: true,
              twoFactorVerified: false,
            };
          }

          // Vérifier le code TOTP
          const { TOTP } = await import("otpauth");
          const crypto = await import("crypto");

          if (!admin.twoFactorSecret) {
            return null;
          }

          const encryptionKey = process.env.TOTP_ENCRYPTION_KEY;
          if (!encryptionKey) {
            throw new Error("TOTP_ENCRYPTION_KEY non configurée");
          }

          // Déchiffrer le secret
          const parts = admin.twoFactorSecret.split(":");
          const iv = Buffer.from(parts[0], "hex");
          const authTag = Buffer.from(parts[1], "hex");
          const encrypted = Buffer.from(parts[2], "hex");

          const decipher = crypto.createDecipheriv(
            "aes-256-gcm",
            Buffer.from(encryptionKey, "base64"),
            iv
          );
          decipher.setAuthTag(authTag);

          let decrypted = decipher.update(encrypted);
          decrypted = Buffer.concat([decrypted, decipher.final()]);
          const secret = decrypted.toString("utf8");

          // Valider le code TOTP
          const totp = new TOTP({
            secret,
            digits: 6,
            period: 30,
          });

          const isValidCode = totp.validate({
            token: credentials.totpCode as string,
            window: 1,
          });

          if (isValidCode === null) {
            return null;
          }
        }

        // 4. Mettre à jour lastLoginAt
        await prisma.admin.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        // 5. Retourner l'user authentifié
        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          twoFactorEnabled: admin.twoFactorEnabled,
          twoFactorVerified: true,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.twoFactorVerified = user.twoFactorVerified;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.twoFactorEnabled = token.twoFactorEnabled;
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);