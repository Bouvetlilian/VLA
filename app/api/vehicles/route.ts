import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vehicleFiltersSchema } from "@/lib/validations/vehicle";
import { VehicleStatus } from "@prisma/client";

/**
 * GET /api/vehicles
 * Liste tous les véhicules publiés avec filtres
 * Public (pas d'authentification requise)
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer les query params
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);

    // Valider les paramètres avec Zod
    const validationResult = vehicleFiltersSchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Paramètres invalides",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      marque,
      modele,
      annee,
      carburant,
      boite,
      prixMin,
      prixMax,
      kilometrageMax,
      featured,
      page,
      limit,
    } = validationResult.data;

    // Construire les filtres Prisma
    const where: any = {
      status: VehicleStatus.PUBLISHED, // Seulement les véhicules publiés
    };

    if (marque) where.marque = marque;
    if (modele) where.modele = modele;
    if (annee) where.annee = annee;
    if (carburant) where.carburant = carburant;
    if (boite) where.boite = boite;
    if (featured !== undefined) where.featured = featured;

    // Filtres de plage
    if (prixMin || prixMax) {
      where.prix = {};
      if (prixMin) where.prix.gte = prixMin;
      if (prixMax) where.prix.lte = prixMax;
    }

    if (kilometrageMax) {
      where.kilometrage = { lte: kilometrageMax };
    }

    // Compter le total (pour la pagination)
    const total = await prisma.vehicle.count({ where });

    // Récupérer les véhicules avec pagination
    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        images: {
          orderBy: { position: "asc" },
        },
      },
      orderBy: [
        { featured: "desc" }, // Véhicules "coup de cœur" en premier
        { createdAt: "desc" }, // Puis les plus récents
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      vehicles,
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
    console.error("[API] Erreur GET /api/vehicles:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des véhicules" },
      { status: 500 }
    );
  }
}