import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { AdminRole } from "@prisma/client";

// Schéma de validation pour créer un admin
const createAdminSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  password: z
    .string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
    ),
  role: z.nativeEnum(AdminRole).default(AdminRole.ADMIN),
});

// Schéma de validation pour modifier un admin
const updateAdminSchema = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
  role: z.nativeEnum(AdminRole).optional(),
});

/**
 * GET /api/admin/admins
 * Liste tous les administrateurs
 * Réservé aux SUPER_ADMIN
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est SUPER_ADMIN
    await requireSuperAdmin();

    // Récupérer tous les admins (sauf les mots de passe et secrets 2FA)
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
      orderBy: [
        { role: "desc" }, // SUPER_ADMIN en premier
        { createdAt: "asc" }, // Puis par ordre de création
      ],
    });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error("[API ADMIN] Erreur GET /api/admin/admins:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json(
        { error: "Accès refusé - Réservé aux super administrateurs" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la récupération des administrateurs" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/admins
 * Crée un nouvel administrateur
 * Réservé aux SUPER_ADMIN
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est SUPER_ADMIN
    await requireSuperAdmin();

    // Récupérer le body de la requête
    const body = await request.json();

    // Valider les données avec Zod
    const validationResult = createAdminSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, name, password, role } = validationResult.data;

    // Vérifier que l'email n'existe pas déjà
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Un administrateur avec cet email existe déjà" },
        { status: 400 },
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'admin
    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log("[API ADMIN] Nouvel administrateur créé:", {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Administrateur créé avec succès",
        admin,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[API ADMIN] Erreur POST /api/admin/admins:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json(
        { error: "Accès refusé - Réservé aux super administrateurs" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de l'administrateur" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/admins
 * Modifie un administrateur (activation/désactivation, rôle)
 * Réservé aux SUPER_ADMIN
 *
 * Note: L'ID de l'admin à modifier est passé dans le body
 */
export async function PATCH(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est SUPER_ADMIN
    const session = await requireSuperAdmin();

    // Récupérer le body de la requête
    const body = await request.json();

    const { adminId, ...updateData } = body;

    if (!adminId) {
      return NextResponse.json(
        { error: "ID administrateur manquant" },
        { status: 400 },
      );
    }

    // Valider les données de mise à jour
    const validationResult = updateAdminSchema.safeParse(updateData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Vérifier que l'admin existe
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { error: "Administrateur non trouvé" },
        { status: 404 },
      );
    }

    // Empêcher un admin de se désactiver lui-même
    if (
      adminId === session.user?.id &&
      validationResult.data.isActive === false
    ) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas désactiver votre propre compte" },
        { status: 400 },
      );
    }

    // Mettre à jour l'admin
    const admin = await prisma.admin.update({
      where: { id: adminId },
      data: validationResult.data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    console.log("[API ADMIN] Administrateur modifié:", {
      id: admin.id,
      email: admin.email,
      isActive: admin.isActive,
    });

    return NextResponse.json({
      success: true,
      message: "Administrateur modifié avec succès",
      admin,
    });
  } catch (error) {
    console.error("[API ADMIN] Erreur PATCH /api/admin/admins:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json(
        { error: "Accès refusé - Réservé aux super administrateurs" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la modification de l'administrateur" },
      { status: 500 },
    );
  }
}
