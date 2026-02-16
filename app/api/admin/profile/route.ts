// app/api/admin/profile/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// API Admin - Gestion du profil de l'admin connecté
// PATCH /api/admin/profile - Mettre à jour nom et/ou email
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ── Schéma de validation ──────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .optional(),
  email: z
    .string()
    .email("Email invalide")
    .optional(),
});

// ── PATCH - Mettre à jour le profil ──────────────────────────────────────────

export async function PATCH(req: Request) {
  try {
    // 1. Vérifier l'authentification
    const session = await requireAuth();

    // 2. Parser et valider le body
    const body = await req.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, email } = validation.data;

    // 3. Vérifier qu'au moins un champ est fourni
    if (!name && !email) {
      return NextResponse.json(
        { error: "Aucune modification fournie" },
        { status: 400 }
      );
    }

    // 4. Si l'email change, vérifier qu'il n'est pas déjà utilisé
    if (email && email !== session.user.email) {
      const existingAdmin = await prisma.admin.findUnique({
        where: { email },
      });

      if (existingAdmin) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé" },
          { status: 409 }
        );
      }
    }

    // 5. Préparer les données à mettre à jour
    const updateData: { name?: string; email?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // 6. Mettre à jour l'admin en base
    const updatedAdmin = await prisma.admin.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    // 7. Retourner les nouvelles infos
    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/profile] Erreur:", error);

    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}