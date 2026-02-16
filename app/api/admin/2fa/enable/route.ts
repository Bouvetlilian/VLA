// app/api/admin/2fa/enable/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// API Admin - Activation 2FA - Étape 1
// POST /api/admin/2fa/enable - Générer secret TOTP + QR code
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAuth, generate2FASecret } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── POST - Générer le secret 2FA ─────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Vérifier l'authentification
    const session = await requireAuth();

    // 2. Vérifier que le 2FA n'est pas déjà activé
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin introuvable" },
        { status: 404 }
      );
    }

    if (admin.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Le 2FA est déjà activé" },
        { status: 400 }
      );
    }

    // 3. Générer le secret TOTP
    const { secret, encryptedSecret, qrCodeUrl } = await generate2FASecret();

    // 4. Stocker temporairement le secret chiffré en session
    // (On ne l'active pas encore tant que le code n'est pas validé)
    // Pour simplifier, on le stocke dans un champ temporaire
    await prisma.admin.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: encryptedSecret,
        // On ne met PAS twoFactorEnabled à true ici
        // Ce sera fait dans /verify après validation du code
      },
    });

    // 5. Retourner le QR code URL et le secret (pour affichage manuel)
    return NextResponse.json({
      success: true,
      qrCodeUrl, // URL pour générer le QR code côté frontend
      secret, // Secret en clair pour affichage manuel (backup)
      message: "Secret 2FA généré. Scannez le QR code avec Google Authenticator.",
    });
  } catch (error) {
    console.error("[POST /api/admin/2fa/enable] Erreur:", error);

    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la génération du secret 2FA" },
      { status: 500 }
    );
  }
}