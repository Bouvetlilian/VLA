// app/api/admin/2fa/verify/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// API Admin - Activation 2FA - Étape 2
// POST /api/admin/2fa/verify - Valider le code TOTP et activer le 2FA
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import * as OTPAuth from "otpauth";

// ── Schéma de validation ──────────────────────────────────────────────────────

const verify2FASchema = z.object({
  token: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d{6}$/, "Le code doit être composé uniquement de chiffres"),
});

// ── Fonction helper pour vérifier le code TOTP ───────────────────────────────

async function verifyTOTPToken(
  encryptedSecret: string,
  token: string
): Promise<boolean> {
  try {
    const crypto = await import("crypto");

    // Déchiffrer le secret TOTP
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
    console.error("Erreur validation TOTP:", error);
    return false;
  }
}

// ── POST - Vérifier le code et activer le 2FA ────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Vérifier l'authentification
    const session = await requireAuth();

    // 2. Parser et valider le body
    const body = await req.json();
    const validation = verify2FASchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // 3. Récupérer l'admin avec son secret temporaire
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin introuvable" },
        { status: 404 }
      );
    }

    // 4. Vérifier que le 2FA n'est pas déjà activé
    if (admin.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Le 2FA est déjà activé" },
        { status: 400 }
      );
    }

    // 5. Vérifier qu'un secret existe (généré via /enable)
    if (!admin.twoFactorSecret) {
      return NextResponse.json(
        { error: "Aucun secret 2FA trouvé. Veuillez générer un nouveau QR code." },
        { status: 400 }
      );
    }

    // 6. Valider le code TOTP
    const isValidToken = await verifyTOTPToken(admin.twoFactorSecret, token);

    if (!isValidToken) {
      return NextResponse.json(
        { error: "Code incorrect. Vérifiez et réessayez." },
        { status: 401 }
      );
    }

    // 7. Activer le 2FA définitivement
    await prisma.admin.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: true,
        updatedAt: new Date(),
      },
    });

    // 8. Retourner succès
    return NextResponse.json({
      success: true,
      message: "2FA activé avec succès. Votre compte est maintenant sécurisé.",
    });
  } catch (error) {
    console.error("[POST /api/admin/2fa/verify] Erreur:", error);

    if (error instanceof Error && error.message === "Non authentifié") {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la vérification du code 2FA" },
      { status: 500 }
    );
  }
}