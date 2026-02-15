import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { updateVehicleSchema } from "@/lib/validations/vehicle";
import { uploadImage, deleteImage, deleteMultipleImages, isCloudinaryConfigured } from "@/lib/upload/cloudinary";

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
 * Modifie un véhicule existant avec gestion des images
 * Authentification requise
 * 
 * Accepte JSON ou FormData avec :
 * - Champs du véhicule (optionnels)
 * - imagesToDelete : array d'IDs d'images à supprimer
 * - newImages : nouveaux fichiers à uploader
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
      include: { images: true },
    });

    if (!existingVehicle) {
      return NextResponse.json({ error: "Véhicule non trouvé" }, { status: 404 });
    }

    // Détecter le type de contenu
    const contentType = request.headers.get("content-type") || "";
    const isFormData = contentType.includes("multipart/form-data");

    let updateData: any = {};
    let imagesToDelete: string[] = [];
    let newImageFiles: File[] = [];

    if (isFormData) {
      // ─── Mode FormData avec images ───────────────────────────────────
      
      const formData = await request.formData();

      // Extraire les données du véhicule (tous optionnels)
      const fields = [
        "marque", "modele", "version", "puissance", "couleur", 
        "description", "carburant", "boite", "status", "badge"
      ];

      fields.forEach(field => {
        const value = formData.get(field);
        if (value !== null && value !== "") {
          updateData[field] = value as string;
        }
      });

      // Champs numériques
      const numericFields = ["annee", "kilometrage", "prix", "portes", "places"];
      numericFields.forEach(field => {
        const value = formData.get(field);
        if (value !== null && value !== "") {
          updateData[field] = parseInt(value as string);
        }
      });

      // Boolean
      const featured = formData.get("featured");
      if (featured !== null) {
        updateData.featured = featured === "true";
      }

      // Options (array)
      const options = formData.get("options");
      if (options !== null && options !== "") {
        updateData.options = JSON.parse(options as string);
      }

      // Images à supprimer
      const imagesToDeleteStr = formData.get("imagesToDelete");
      if (imagesToDeleteStr) {
        imagesToDelete = JSON.parse(imagesToDeleteStr as string);
      }

      // Nouvelles images
      newImageFiles = formData.getAll("newImages") as File[];

    } else {
      // ─── Mode JSON (ancien comportement) ─────────────────────────────
      const body = await request.json();
      updateData = body;
    }

    // Valider les données avec Zod (si des champs sont présents)
    if (Object.keys(updateData).length > 0) {
      const validationResult = updateVehicleSchema.safeParse(updateData);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Données invalides",
            details: validationResult.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      updateData = validationResult.data;
    }

    // Si le statut passe à PUBLISHED et qu'il n'y avait pas de publishedAt
    if (updateData.status === "PUBLISHED" && !existingVehicle.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // ─── Gestion des images ───────────────────────────────────────────

    // 1. Supprimer les images demandées
    if (imagesToDelete.length > 0 && isCloudinaryConfigured()) {
      console.log(`[API ADMIN] Suppression de ${imagesToDelete.length} images...`);
      
      // Récupérer les publicIds avant suppression
      const imagesToRemove = existingVehicle.images.filter(img => 
        imagesToDelete.includes(img.id)
      );

      // Supprimer de Cloudinary
      for (const image of imagesToRemove) {
        if (image.publicId) {
          try {
            await deleteImage(image.publicId);
          } catch (error) {
            console.error("[API ADMIN] Erreur suppression Cloudinary:", error);
          }
        }
      }

      // Supprimer de la base
      await prisma.vehicleImage.deleteMany({
        where: {
          id: { in: imagesToDelete },
        },
      });
    }

    // 2. Ajouter de nouvelles images
    const uploadedImages: Array<{ url: string; publicId: string }> = [];

    if (newImageFiles.length > 0 && isCloudinaryConfigured()) {
      console.log(`[API ADMIN] Upload de ${newImageFiles.length} nouvelles images...`);
      
      for (const file of newImageFiles) {
        if (file.size > 0) {
          try {
            const result = await uploadImage(file, "vehicles");
            uploadedImages.push(result);
          } catch (error) {
            console.error("[API ADMIN] Erreur upload image:", error);
          }
        }
      }

      // Ajouter les nouvelles images en base
      if (uploadedImages.length > 0) {
        // Récupérer la position max actuelle
        const currentImages = await prisma.vehicleImage.findMany({
          where: { vehicleId },
          orderBy: { position: "desc" },
          take: 1,
        });

        const maxPosition = currentImages.length > 0 ? currentImages[0].position : -1;

        await prisma.vehicleImage.createMany({
          data: uploadedImages.map((img, index) => ({
            vehicleId,
            url: img.url,
            publicId: img.publicId,
            position: maxPosition + 1 + index,
            isMain: false, // L'image principale reste la même
            alt: `${existingVehicle.marque} ${existingVehicle.modele} - Photo ${maxPosition + 2 + index}`,
          })),
        });
      }
    }

    // ─── Mise à jour du véhicule ──────────────────────────────────────

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
      imagesCount: vehicle.images.length,
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
      { 
        error: "Erreur lors de la modification du véhicule",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/vehicles/[id]
 * Supprime un véhicule et ses images (Cloudinary + base de données)
 * Authentification requise
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

    // Récupérer le véhicule avec ses images
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        images: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule non trouvé" }, { status: 404 });
    }

    // Supprimer les images de Cloudinary
    if (vehicle.images.length > 0 && isCloudinaryConfigured()) {
      console.log(`[API ADMIN] Suppression de ${vehicle.images.length} images de Cloudinary...`);
      
      const publicIds = vehicle.images
        .map(img => img.publicId)
        .filter((id): id is string => id !== null);

      if (publicIds.length > 0) {
        try {
          await deleteMultipleImages(publicIds);
          console.log(`[API ADMIN] ${publicIds.length} images supprimées de Cloudinary`);
        } catch (error) {
          console.error("[API ADMIN] Erreur suppression images Cloudinary:", error);
          // On continue même si la suppression Cloudinary échoue
        }
      }
    }

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
      { 
        error: "Erreur lors de la suppression du véhicule",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}