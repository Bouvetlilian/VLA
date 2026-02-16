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
    // TAUX DE CONVERSION
    // ──────────────────────────────────────────────────────────────

    const totalLeads = buyLeadsStats.total + sellLeadsStats.total;
    const treatedLeads = buyLeadsStats[LeadStatus.TREATED] + sellLeadsStats[LeadStatus.TREATED];
    const conversionRate = totalLeads > 0 ? (treatedLeads / totalLeads) * 100 : 0;

    // ──────────────────────────────────────────────────────────────
    // ÉVOLUTION DES LEADS (30 derniers jours)
    // ──────────────────────────────────────────────────────────────

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Leads achat des 30 derniers jours
    const recentBuyLeads = await prisma.buyLead.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Leads vente des 30 derniers jours
    const recentSellLeads = await prisma.sellLead.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Grouper par semaine (4 dernières semaines)
    const leadsTimeline = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (3 - i) * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const buyCount = recentBuyLeads.filter(
        (lead) => lead.createdAt >= weekStart && lead.createdAt < weekEnd
      ).length;

      const sellCount = recentSellLeads.filter(
        (lead) => lead.createdAt >= weekStart && lead.createdAt < weekEnd
      ).length;

      return {
        week: `S${i + 1}`,
        buyLeads: buyCount,
        sellLeads: sellCount,
        total: buyCount + sellCount,
      };
    });

    // ──────────────────────────────────────────────────────────────
    // TOP 5 MARQUES LES PLUS DEMANDÉES
    // ──────────────────────────────────────────────────────────────

    // Compter les leads achat par marque de véhicule
    const buyLeadsWithVehicle = await prisma.buyLead.findMany({
      include: {
        vehicle: {
          select: {
            marque: true,
          },
        },
      },
    });

    const brandCounts: Record<string, number> = {};
    
    buyLeadsWithVehicle.forEach((lead) => {
      const brand = lead.vehicle.marque;
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    // Ajouter les marques des leads vente
    const sellLeadsAll = await prisma.sellLead.findMany({
      select: {
        marque: true,
      },
    });

    sellLeadsAll.forEach((lead) => {
      brandCounts[lead.marque] = (brandCounts[lead.marque] || 0) + 1;
    });

    // Trier et prendre le top 5
    const topBrands = Object.entries(brandCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([brand, count]) => ({
        brand,
        count,
      }));

    // ──────────────────────────────────────────────────────────────
    // VÉHICULES LES PLUS POPULAIRES (avec le plus de leads)
    // ──────────────────────────────────────────────────────────────

    const popularVehicles = await prisma.vehicle.findMany({
      where: {
        status: VehicleStatus.PUBLISHED,
      },
      include: {
        _count: {
          select: {
            buyLeads: true,
          },
        },
      },
      orderBy: {
        buyLeads: {
          _count: "desc",
        },
      },
      take: 5,
    });

    const topVehicles = popularVehicles.map((vehicle) => ({
      id: vehicle.id,
      slug: vehicle.slug,
      marque: vehicle.marque,
      modele: vehicle.modele,
      annee: vehicle.annee,
      prix: vehicle.prix,
      leadsCount: vehicle._count.buyLeads,
    }));

    // ──────────────────────────────────────────────────────────────
    // RÉPARTITION PAR STATUT (pour graphiques)
    // ──────────────────────────────────────────────────────────────

    const vehicleStatusDistribution = [
      { name: "Publiés", value: vehiclesStats[VehicleStatus.PUBLISHED], color: "#10B981" },
      { name: "Brouillons", value: vehiclesStats[VehicleStatus.DRAFT], color: "#6B7280" },
      { name: "Réservés", value: vehiclesStats[VehicleStatus.RESERVED], color: "#F59E0B" },
      { name: "Vendus", value: vehiclesStats[VehicleStatus.SOLD], color: "#EF4444" },
    ];

    const leadsTypeDistribution = [
      { name: "Demandes d'achat", value: buyLeadsStats.total, color: "#FF8633" },
      { name: "Demandes de vente", value: sellLeadsStats.total, color: "#8B5CF6" },
    ];

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
      // Stats globales
      vehicles: vehiclesStats,
      buyLeads: buyLeadsStats,
      sellLeads: sellLeadsStats,
      
      // KPIs
      kpis: {
        totalLeads,
        treatedLeads,
        conversionRate: Math.round(conversionRate * 10) / 10, // Arrondi à 1 décimale
        activeVehicles: vehiclesStats[VehicleStatus.PUBLISHED],
      },
      
      // Graphiques
      timeline: leadsTimeline,
      topBrands,
      topVehicles,
      vehicleStatusDistribution,
      leadsTypeDistribution,
      
      // Activité récente
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