import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { updateVehicleSchema } from "@/lib/validations/vehicle";

/**
 * GET /api/admin/vehicles/[id]
 * Récupère le détail complet d'un véhicule
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
    const vehicleId = parseInt(id, 10);

    if (isNaN(vehicleId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // Récupérer le véhicule avec toutes les relations
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        images: {
          orderBy: { position: "asc" },
        },
        buyLeads: {
          orderBy: { createdAt: "desc" },
          take: 10, // Les 10 derniers leads
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error(`[API ADMIN] Erreur GET /api/admin/vehicles/[id]:`, error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la récupération du véhicule" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/vehicles/[id]
 * Modifie un véhicule existant
 * Authentification requise
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    await requireAuth();

    const { id } = await context.params;
    const vehicleId = parseInt(id, 10);

    if (isNaN(vehicleId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // Vérifier que le véhicule existe
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: "Véhicule non trouvé" }, { status: 404 });
    }

    // Récupérer le body de la requête
    const body = await request.json();

    // Valider les données avec Zod
    const validationResult = updateVehicleSchema.safeParse(body);

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

    // Si le statut passe à PUBLISHED et qu'il n'y avait pas de publishedAt
    const updateData: any = { ...data };
    if (data.status === "PUBLISHED" && !existingVehicle.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Mettre à jour le véhicule
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
      include: {
        images: {
          orderBy: { position: "asc" },
        },
      },
    });

    console.log("[API ADMIN] Véhicule modifié:", {
      id: vehicle.id,
      slug: vehicle.slug,
      status: vehicle.status,
    });

    return NextResponse.json({
      success: true,
      message: "Véhicule modifié avec succès",
      vehicle,
    });
  } catch (error) {
    console.error(`[API ADMIN] Erreur PUT /api/admin/vehicles/[id]:`, error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la modification du véhicule" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/vehicles/[id]
 * Supprime un véhicule et ses images
 * Authentification requise
 * 
 * Note: Pour l'instant, seul le véhicule en base est supprimé.
 * La suppression des images Cloudinary sera implémentée à l'étape 6.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    await requireAuth();

    const { id } = await context.params;
    const vehicleId = parseInt(id, 10);

    if (isNaN(vehicleId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // Vérifier que le véhicule existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        images: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule non trouvé" }, { status: 404 });
    }

    // TODO (Étape 6) : Supprimer les images sur Cloudinary
    // for (const image of vehicle.images) {
    //   if (image.publicId) {
    //     await deleteImageFromCloudinary(image.publicId);
    //   }
    // }

    // Supprimer le véhicule (cascade sur les images via Prisma)
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    console.log("[API ADMIN] Véhicule supprimé:", {
      id: vehicleId,
      slug: vehicle.slug,
      imagesCount: vehicle.images.length,
    });

    return NextResponse.json({
      success: true,
      message: "Véhicule supprimé avec succès",
    });
  } catch (error) {
    console.error(`[API ADMIN] Erreur DELETE /api/admin/vehicles/[id]:`, error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la suppression du véhicule" },
      { status: 500 }
    );
  }
}