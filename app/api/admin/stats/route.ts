import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { VehicleStatus, LeadStatus } from "@prisma/client";

/**
 * GET /api/admin/stats
 * Récupère les KPIs pour le dashboard admin
 * Authentification requise
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    await requireAuth();

    // ──────────────────────────────────────────────────────────────
    // STATS VÉHICULES
    // ──────────────────────────────────────────────────────────────

    // Compter les véhicules par statut
    const vehiclesByStatus = await prisma.vehicle.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const vehiclesStats = {
      [VehicleStatus.DRAFT]: 0,
      [VehicleStatus.PUBLISHED]: 0,
      [VehicleStatus.SOLD]: 0,
      [VehicleStatus.RESERVED]: 0,
      total: 0,
    };

    vehiclesByStatus.forEach((stat) => {
      vehiclesStats[stat.status] = stat._count.status;
      vehiclesStats.total += stat._count.status;
    });

    // ──────────────────────────────────────────────────────────────
    // STATS LEADS ACHAT
    // ──────────────────────────────────────────────────────────────

    // Compter les leads achat par statut
    const buyLeadsByStatus = await prisma.buyLead.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const buyLeadsStats = {
      [LeadStatus.NEW]: 0,
      [LeadStatus.IN_PROGRESS]: 0,
      [LeadStatus.TREATED]: 0,
      [LeadStatus.ARCHIVED]: 0,
      total: 0,
    };

    buyLeadsByStatus.forEach((stat) => {
      buyLeadsStats[stat.status] = stat._count.status;
      buyLeadsStats.total += stat._count.status;
    });

    // ──────────────────────────────────────────────────────────────
    // STATS LEADS VENTE
    // ──────────────────────────────────────────────────────────────

    // Compter les leads vente par statut
    const sellLeadsByStatus = await prisma.sellLead.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const sellLeadsStats = {
      [LeadStatus.NEW]: 0,
      [LeadStatus.IN_PROGRESS]: 0,
      [LeadStatus.TREATED]: 0,
      [LeadStatus.ARCHIVED]: 0,
      total: 0,
    };

    sellLeadsByStatus.forEach((stat) => {
      sellLeadsStats[stat.status] = stat._count.status;
      sellLeadsStats.total += stat._count.status;
    });

    // ──────────────────────────────────────────────────────────────
    // ÉVOLUTION DES LEADS (7 derniers jours)
    // ──────────────────────────────────────────────────────────────

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Leads achat des 7 derniers jours
    const recentBuyLeads = await prisma.buyLead.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Leads vente des 7 derniers jours
    const recentSellLeads = await prisma.sellLead.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Grouper par jour
    const leadsTimeline = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const buyCount = recentBuyLeads.filter(
        (lead) => lead.createdAt >= date && lead.createdAt < nextDate
      ).length;

      const sellCount = recentSellLeads.filter(
        (lead) => lead.createdAt >= date && lead.createdAt < nextDate
      ).length;

      return {
        date: date.toISOString().split("T")[0], // Format YYYY-MM-DD
        buyLeads: buyCount,
        sellLeads: sellCount,
        total: buyCount + sellCount,
      };
    });

    // ──────────────────────────────────────────────────────────────
    // LEADS RÉCENTS (5 derniers)
    // ──────────────────────────────────────────────────────────────

    const latestBuyLeads = await prisma.buyLead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: {
          select: {
            id: true,
            marque: true,
            modele: true,
            slug: true,
          },
        },
      },
    });

    const latestSellLeads = await prisma.sellLead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        marque: true,
        modele: true,
        annee: true,
        prenom: true,
        nom: true,
        status: true,
        createdAt: true,
      },
    });

    // ──────────────────────────────────────────────────────────────
    // RÉPONSE
    // ──────────────────────────────────────────────────────────────

    return NextResponse.json({
      vehicles: vehiclesStats,
      buyLeads: buyLeadsStats,
      sellLeads: sellLeadsStats,
      timeline: leadsTimeline,
      recentActivity: {
        buyLeads: latestBuyLeads,
        sellLeads: latestSellLeads,
      },
    });
  } catch (error) {
    console.error("[API ADMIN] Erreur GET /api/admin/stats:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}