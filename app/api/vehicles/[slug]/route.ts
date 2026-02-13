import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VehicleStatus } from "@prisma/client";

/**
 * GET /api/vehicles/[slug]
 * Récupère le détail d'un véhicule par son slug
 * Public (pas d'authentification requise)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params pour Next.js 15+
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: "Slug manquant" }, { status: 400 });
    }

    // Récupérer le véhicule avec toutes ses images
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { position: "asc" },
        },
      },
    });

    // Vérifier que le véhicule existe
    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule non trouvé" }, { status: 404 });
    }

    // Vérifier que le véhicule est publié (sécurité)
    if (vehicle.status !== VehicleStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Ce véhicule n'est pas disponible" },
        { status: 404 }
      );
    }

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error(`[API] Erreur GET /api/vehicles/[slug]:`, error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du véhicule" },
      { status: 500 }
    );
  }
}