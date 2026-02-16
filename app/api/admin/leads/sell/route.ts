import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sellLeadFiltersSchema } from "@/lib/validations/lead";
import { LeadStatus } from "@prisma/client";

/**
 * GET /api/admin/leads/sell
 * Liste tous les leads vente avec filtres et stats
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
    const validationResult = sellLeadFiltersSchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Paramètres invalides",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status, marque, assignedTo, dateFrom, dateTo, page, limit } =
      validationResult.data;

    // Construire les filtres Prisma
    const where: any = {};

    if (status) where.status = status;
    if (marque) where.marque = marque;
    if (assignedTo) where.assignedTo = assignedTo;

    // Filtres de dates
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    // Compter le total
    const total = await prisma.sellLead.count({ where });

    // Récupérer les leads
    const leads = await prisma.sellLead.findMany({
      where,
      include: {
        photos: true,
      },
      orderBy: [
        { createdAt: "desc" }, // Les plus récents en premier
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculer les stats par statut (sur TOUS les leads, pas juste la page actuelle)
    const statsRaw = await prisma.sellLead.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    // Formater les stats pour le frontend (camelCase)
    const statsMap: Record<string, number> = {
      [LeadStatus.NEW]: 0,
      [LeadStatus.IN_PROGRESS]: 0,
      [LeadStatus.TREATED]: 0,
      [LeadStatus.ARCHIVED]: 0,
    };

    statsRaw.forEach((stat) => {
      statsMap[stat.status] = stat._count.status;
    });

    // Calculer le total de tous les leads (pas juste ceux filtrés)
    const totalAllLeads = Object.values(statsMap).reduce((sum, count) => sum + count, 0);

    // Retourner les stats au format attendu par le frontend
    const stats = {
      total: totalAllLeads,
      new: statsMap[LeadStatus.NEW],
      inProgress: statsMap[LeadStatus.IN_PROGRESS],
      treated: statsMap[LeadStatus.TREATED],
      archived: statsMap[LeadStatus.ARCHIVED],
    };

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      leads,
      stats,
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
    console.error("[API ADMIN] Erreur GET /api/admin/leads/sell:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la récupération des leads" },
      { status: 500 }
    );
  }
}