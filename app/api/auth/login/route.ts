// app/api/auth/login/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// API Route : Connexion admin avec support 2FA
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/jwt";

// ── Handler POST ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Parser le body
    const body = await request.json();
    const { email, password, totpCode } = body;

    // Validation simple
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // 2. Récupérer l'admin depuis la base
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // 3. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // 4. Si 2FA activé, vérifier le code TOTP
    if (admin.twoFactorEnabled) {
      if (!totpCode) {
        // Premier passage : mot de passe OK mais code 2FA manquant
        return NextResponse.json(
          {
            requires2FA: true,
            message: "Code 2FA requis",
          },
          { status: 200 }
        );
      }

      // Vérifier le code TOTP
      const { TOTP } = await import("otpauth");
      const crypto = await import("crypto");

      if (!admin.twoFactorSecret) {
        return NextResponse.json(
          { error: "2FA non configuré" },
          { status: 500 }
        );
      }

      const encryptionKey = process.env.TOTP_ENCRYPTION_KEY;
      if (!encryptionKey) {
        return NextResponse.json(
          { error: "Configuration serveur invalide" },
          { status: 500 }
        );
      }

      // Déchiffrer le secret TOTP
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
        token: totpCode,
        window: 1, // Accepte ±30s de décalage
      });

      if (isValidCode === null) {
        return NextResponse.json(
          { error: "Code 2FA invalide" },
          { status: 401 }
        );
      }
    }

    // 5. Mettre à jour la date de dernière connexion
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // 6. Créer la session JWT
    await createSession({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      twoFactorEnabled: admin.twoFactorEnabled,
      twoFactorVerified: true,
    });

    // 7. Retourner succès
    return NextResponse.json(
      {
        success: true,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur login:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}