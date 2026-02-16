// app/api/admin/password/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// API Admin - Changement de mot de passe
// POST /api/admin/password - Changer le mot de passe de l'admin connecté
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

// ── Schéma de validation ──────────────────────────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// ── POST - Changer le mot de passe ───────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Vérifier l'authentification
    const session = await requireAuth();

    // 2. Parser et valider le body
    const body = await req.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // 3. Récupérer l'admin avec son mot de passe
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin introuvable" },
        { status: 404 }
      );
    }

    // 4. Vérifier l'ancien mot de passe
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Mot de passe actuel incorrect" },
        { status: 401 }
      );
    }

    // 5. Vérifier que le nouveau mot de passe est différent
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit être différent de l'ancien" },
        { status: 400 }
      );
    }

    // 6. Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 7. Mettre à jour en base
    await prisma.admin.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // 8. Retourner succès
    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("[POST /api/admin/password] Erreur:", error);

    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors du changement de mot de passe" },
      { status: 500 }
    );
  }
}