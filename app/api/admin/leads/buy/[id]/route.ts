import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { updateBuyLeadSchema } from "@/lib/validations/lead";

/**
 * GET /api/admin/leads/buy/[id]
 * Récupère le détail complet d'un lead achat
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

    // Récupérer le lead avec toutes les relations
    const lead = await prisma.buyLead.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error(`[API ADMIN] Erreur GET /api/admin/leads/buy/[id]:`, error);

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
 * PATCH /api/admin/leads/buy/[id]
 * Modifie un lead achat (status, notes, assignation)
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
    const existingLead = await prisma.buyLead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead non trouvé" }, { status: 404 });
    }

    // Récupérer le body de la requête
    const body = await request.json();

    // Valider les données avec Zod
    const validationResult = updateBuyLeadSchema.safeParse(body);

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

    // Mettre à jour le lead
    const lead = await prisma.buyLead.update({
      where: { id },
      data: updateData,
      include: {
        vehicle: {
          select: {
            id: true,
            marque: true,
            modele: true,
            annee: true,
            slug: true,
          },
        },
      },
    });

    console.log("[API ADMIN] Lead achat modifié:", {
      id: lead.id,
      status: lead.status,
      assignedTo: lead.assignedTo,
    });

    return NextResponse.json({
      success: true,
      message: "Lead modifié avec succès",
      lead,
    });
  } catch (error) {
    console.error(`[API ADMIN] Erreur PATCH /api/admin/leads/buy/[id]:`, error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la modification du lead" },
      { status: 500 }
    );
  }
}