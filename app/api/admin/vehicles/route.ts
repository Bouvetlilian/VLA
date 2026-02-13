import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createVehicleSchema, vehicleFiltersSchema } from "@/lib/validations/vehicle";

/**
 * GET /api/admin/vehicles
 * Liste tous les véhicules (tous statuts) avec filtres
 * Authentification requise
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    await requireAuth();

    // Récupérer les query params
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);

    // Valider les paramètres avec Zod (sans forcer status = PUBLISHED)
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
      status,
      featured,
      page,
      limit,
    } = validationResult.data;

    // Construire les filtres Prisma
    const where: any = {};

    if (marque) where.marque = marque;
    if (modele) where.modele = modele;
    if (annee) where.annee = annee;
    if (carburant) where.carburant = carburant;
    if (boite) where.boite = boite;
    if (status) where.status = status;
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

    // Compter le total
    const total = await prisma.vehicle.count({ where });

    // Récupérer les véhicules
    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        images: {
          orderBy: { position: "asc" },
        },
        _count: {
          select: {
            buyLeads: true, // Compter les leads associés
          },
        },
      },
      orderBy: [
        { updatedAt: "desc" }, // Les plus récemment modifiés
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
    console.error("[API ADMIN] Erreur GET /api/admin/vehicles:", error);

    // Si erreur d'authentification
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la récupération des véhicules" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/vehicles
 * Crée un nouveau véhicule
 * Authentification requise
 * 
 * Note: Pour l'instant, les images doivent être uploadées séparément
 * L'upload Cloudinary sera implémenté à l'étape 6
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    await requireAuth();

    // Récupérer le body de la requête
    const body = await request.json();

    // Valider les données avec Zod
    const validationResult = createVehicleSchema.safeParse(body);

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

    // Générer un slug unique à partir de marque-modele-annee
    const baseSlug = `${data.marque}-${data.modele}-${data.annee}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
      .replace(/[^a-z0-9]+/g, "-") // Remplacer les caractères spéciaux par -
      .replace(/^-+|-+$/g, ""); // Retirer les tirets en début/fin

    // Vérifier l'unicité du slug et ajouter un suffixe si nécessaire
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.vehicle.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Créer le véhicule
    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        slug,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
      include: {
        images: true,
      },
    });

    console.log("[API ADMIN] Véhicule créé:", {
      id: vehicle.id,
      slug: vehicle.slug,
      marque: vehicle.marque,
      modele: vehicle.modele,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Véhicule créé avec succès",
        vehicle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API ADMIN] Erreur POST /api/admin/vehicles:", error);

    // Si erreur d'authentification
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du véhicule" },
      { status: 500 }
    );
  }
}