// lib/prisma.ts
// ─────────────────────────────────────────────────────────────────────────────
// Client Prisma singleton
//
// En développement Next.js, le hot-reload recrée les modules à chaque
// modification. Sans ce pattern, on créerait une nouvelle connexion à chaque
// reload → épuisement du pool de connexions Supabase.
//
// Solution : stocker l'instance sur l'objet global (non affecté par le HMR).
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;