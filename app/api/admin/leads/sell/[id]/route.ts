import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { updateSellLeadSchema } from "@/lib/validations/lead";

/**
 * GET /api/admin/leads/sell/[id]
 * Récupère le détail complet d'un lead vente
 * Authentification requise
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    await requireAuth();

    const { id } = await context.params;

    // Récupérer le lead avec toutes les photos
    const lead = await prisma.sellLead.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error(`[API ADMIN] Erreur GET /api/admin/leads/sell/[id]:`, error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la récupération du lead" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/leads/sell/[id]
 * Modifie un lead vente (status, notes, assignation, estimation)
 * Authentification requise
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    await requireAuth();

    const { id } = await context.params;

    // Vérifier que le lead existe
    const existingLead = await prisma.sellLead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead non trouvé" }, { status: 404 });
    }

    // Récupérer le body de la requête
    const body = await request.json();

    // Valider les données avec Zod
    const validationResult = updateSellLeadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (data.status !== undefined) {
      updateData.status = data.status;

      // Si le statut passe à TREATED, enregistrer la date
      if (data.status === "TREATED" && existingLead.status !== "TREATED") {
        updateData.treatedAt = new Date();
      }
    }

    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.estimation !== undefined) updateData.estimation = data.estimation;

    // Mettre à jour le lead
    const lead = await prisma.sellLead.update({
      where: { id },
      data: updateData,
      include: {
        photos: true,
      },
    });

    console.log("[API ADMIN] Lead vente modifié:", {
      id: lead.id,
      status: lead.status,
      assignedTo: lead.assignedTo,
      estimation: lead.estimation,
    });

    return NextResponse.json({
      success: true,
      message: "Lead modifié avec succès",
      lead,
    });
  } catch (error) {
    console.error(`[API ADMIN] Erreur PATCH /api/admin/leads/sell/[id]:`, error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la modification du lead" },
      { status: 500 }
    );
  }
}