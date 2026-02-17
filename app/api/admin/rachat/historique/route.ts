import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const marque = searchParams.get("marque") || undefined;
    const skip = (page - 1) * limit;

    const where = marque ? { marque } : {};

    const [estimations, total] = await Promise.all([
      prisma.rachatEstimation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          marque: true,
          modele: true,
          version: true,
          annee: true,
          kilometrage: true,
          carburant: true,
          boite: true,
          etat: true,
          marchePrixMedian: true,
          rachatPrixConseille: true,
          rachatMargeEstimee: true,
          marcheTendance: true,
          marcheLiquidite: true,
          adminName: true,
          createdAt: true,
        },
      }),
      prisma.rachatEstimation.count({ where }),
    ]);

    return NextResponse.json({
      estimations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API HISTORIQUE] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}