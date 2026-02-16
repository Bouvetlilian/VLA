// app/api/admin/2fa/disable/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// API Admin - Désactivation 2FA
// POST /api/admin/2fa/disable - Désactiver le 2FA (avec validation password)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

// ── Schéma de validation ──────────────────────────────────────────────────────

const disable2FASchema = z.object({
  password: z.string().min(1, "Mot de passe requis pour désactiver le 2FA"),
});

// ── POST - Désactiver le 2FA ─────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Vérifier l'authentification
    const session = await requireAuth();

    // 2. Parser et valider le body
    const body = await req.json();
    const validation = disable2FASchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { password } = validation.data;

    // 3. Récupérer l'admin avec son mot de passe et son statut 2FA
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
        twoFactorEnabled: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin introuvable" },
        { status: 404 }
      );
    }

    // 4. Vérifier que le 2FA est bien activé
    if (!admin.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Le 2FA n'est pas activé sur ce compte" },
        { status: 400 }
      );
    }

    // 5. Vérifier le mot de passe (sécurité)
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    }

    // 6. Désactiver le 2FA et supprimer le secret
    await prisma.admin.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        updatedAt: new Date(),
      },
    });

    // 7. Retourner succès
    return NextResponse.json({
      success: true,
      message: "2FA désactivé avec succès. Votre compte n'utilise plus la double authentification.",
    });
  } catch (error) {
    console.error("[POST /api/admin/2fa/disable] Erreur:", error);

    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la désactivation du 2FA" },
      { status: 500 }
    );
  }
}