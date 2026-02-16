// app/api/auth/check-2fa/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// API pour vérifier si un utilisateur a le 2FA activé
// Cette route est appelée AVANT signIn pour savoir s'il faut demander le code
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'admin existe
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        isActive: true,
        twoFactorEnabled: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Vérifier que le compte est actif
    if (!admin.isActive) {
      return NextResponse.json(
        { error: "Ce compte a été désactivé" },
        { status: 403 }
      );
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Si on arrive ici, l'email et le mot de passe sont corrects
    // On retourne si le 2FA est activé ou non
    return NextResponse.json({
      requires2FA: admin.twoFactorEnabled,
    });
  } catch (error) {
    console.error("[POST /api/auth/check-2fa] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}