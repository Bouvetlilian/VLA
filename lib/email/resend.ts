// lib/email/resend.ts
// ─────────────────────────────────────────────────────────────────────────────
// Configuration Resend pour l'envoi d'emails transactionnels
//
// Utilisé pour :
// - Notifications admins lors de nouveaux leads (achat/vente)
// - Confirmations clients (optionnel - future extension)
// ─────────────────────────────────────────────────────────────────────────────

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Initialisation du client Resend
// ─────────────────────────────────────────────────────────────────────────────

if (!process.env.RESEND_API_KEY) {
  throw new Error(
    "RESEND_API_KEY manquante dans les variables d'environnement"
  );
}

const resend = new Resend(process.env.RESEND_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const FROM_EMAIL = "VL Automobiles <onboarding@resend.dev>";
const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || "contact@vl-automobiles.fr";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  type: "new_buy_lead" | "new_sell_lead";
  refId?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fonction principale d'envoi d'email
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmail({
  to,
  subject,
  html,
  type,
  refId,
}: SendEmailParams): Promise<EmailResult> {
  try {
    // Envoyer l'email via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[EMAIL] Erreur Resend:", error);

      // Logger l'échec en base de données
      await prisma.notificationLog.create({
        data: {
          type,
          recipient: to,
          subject,
          status: "failed",
          error: error.message || "Erreur inconnue",
          refId,
        },
      });

      return {
        success: false,
        error: error.message || "Erreur inconnue",
      };
    }

    console.log("[EMAIL] Email envoyé avec succès:", data?.id);

    // Logger le succès en base de données
    await prisma.notificationLog.create({
      data: {
        type,
        recipient: to,
        subject,
        status: "sent",
        refId,
      },
    });

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";

    console.error("[EMAIL] Exception lors de l'envoi:", errorMessage);

    // Logger l'exception en base de données
    try {
      await prisma.notificationLog.create({
        data: {
          type,
          recipient: to,
          subject,
          status: "failed",
          error: errorMessage,
          refId,
        },
      });
    } catch (dbError) {
      console.error("[EMAIL] Impossible de logger l'erreur:", dbError);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fonction helper : Envoyer notification à l'admin
// ─────────────────────────────────────────────────────────────────────────────

export async function sendAdminNotification(
  subject: string,
  html: string,
  type: "new_buy_lead" | "new_sell_lead",
  refId: string
): Promise<EmailResult> {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject,
    html,
    type,
    refId,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export { FROM_EMAIL, ADMIN_EMAIL };