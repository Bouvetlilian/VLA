import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { buyLeadFiltersSchema } from "@/lib/validations/lead";
import { LeadStatus } from "@prisma/client";

/**
 * GET /api/admin/leads/buy
 * Liste tous les leads achat avec filtres et stats
 * Authentification requise
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    await requireAuth();

    // Récupérer les query params
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);

    // Valider les paramètres avec Zod
    const validationResult = buyLeadFiltersSchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Paramètres invalides",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status, vehicleId, assignedTo, dateFrom, dateTo, page, limit } =
      validationResult.data;

    // Construire les filtres Prisma
    const where: any = {};

    if (status) where.status = status;
    if (vehicleId) where.vehicleId = vehicleId;
    if (assignedTo) where.assignedTo = assignedTo;

    // Filtres de dates
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    // Compter le total
    const total = await prisma.buyLead.count({ where });

    // Récupérer les leads
    const leads = await prisma.buyLead.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            marque: true,
            modele: true,
            annee: true,
            prix: true,
            slug: true,
            status: true,
          },
        },
      },
      orderBy: [
        { createdAt: "desc" }, // Les plus récents en premier
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculer les stats par statut
    const stats = await prisma.buyLead.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    // Formater les stats en objet
    const statsFormatted = {
      [LeadStatus.NEW]: 0,
      [LeadStatus.IN_PROGRESS]: 0,
      [LeadStatus.TREATED]: 0,
      [LeadStatus.ARCHIVED]: 0,
    };

    stats.forEach((stat) => {
      statsFormatted[stat.status] = stat._count.status;
    });

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      leads,
      stats: statsFormatted,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("[API ADMIN] Erreur GET /api/admin/leads/buy:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la récupération des leads" },
      { status: 500 }
    );
  }
}