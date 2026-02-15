import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createVehicleSchema, vehicleFiltersSchema } from "@/lib/validations/vehicle";
import { uploadImage, isCloudinaryConfigured } from "@/lib/upload/cloudinary";

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
 * Crée un nouveau véhicule avec upload d'images sur Cloudinary
 * Authentification requise
 * 
 * Accepte FormData avec :
 * - Champs du véhicule (marque, modele, annee, etc.)
 * - Images (field "images", multiple files)
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    await requireAuth();

    // Détecter le type de contenu
    const contentType = request.headers.get("content-type") || "";
    const isFormData = contentType.includes("multipart/form-data");

    let data: any;
    let imageFiles: File[] = [];

    if (isFormData) {
      // ─── Mode FormData avec images ───────────────────────────────────
      
      // Vérifier que Cloudinary est configuré
      if (!isCloudinaryConfigured()) {
        return NextResponse.json(
          { error: "Cloudinary n'est pas configuré. Vérifiez vos variables d'environnement." },
          { status: 500 }
        );
      }

      const formData = await request.formData();

      // Extraire les données du véhicule
      data = {
        marque: formData.get("marque") as string,
        modele: formData.get("modele") as string,
        annee: parseInt(formData.get("annee") as string),
        version: (formData.get("version") as string) || null,
        kilometrage: parseInt(formData.get("kilometrage") as string),
        prix: parseInt(formData.get("prix") as string),
        carburant: formData.get("carburant") as string,
        boite: formData.get("boite") as string,
        puissance: formData.get("puissance") as string,
        couleur: formData.get("couleur") as string,
        portes: parseInt(formData.get("portes") as string),
        places: parseInt(formData.get("places") as string),
        description: formData.get("description") as string,
        options: JSON.parse(formData.get("options") as string || "[]") as string[],
        status: formData.get("status") as string,
        badge: (formData.get("badge") as string) || null,
        featured: formData.get("featured") === "true",
      };

      // Récupérer les fichiers images
      imageFiles = formData.getAll("images") as File[];

    } else {
      // ─── Mode JSON (ancien comportement) ─────────────────────────────
      data = await request.json();
    }

    // Valider les données avec Zod
    const validationResult = createVehicleSchema.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    // Générer un slug unique à partir de marque-modele-annee
    const baseSlug = `${validData.marque}-${validData.modele}-${validData.annee}`
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

    // ─── Upload des images sur Cloudinary (si présentes) ─────────────

    const uploadedImages: Array<{ url: string; publicId: string }> = [];

    if (imageFiles.length > 0) {
      console.log(`[API ADMIN] Upload de ${imageFiles.length} images sur Cloudinary...`);
      
      for (const file of imageFiles) {
        if (file.size > 0) { // Vérifier que ce n'est pas un fichier vide
          try {
            const result = await uploadImage(file, "vehicles");
            uploadedImages.push(result);
          } catch (error) {
            console.error("[API ADMIN] Erreur upload image:", error);
            // On continue même si une image échoue
          }
        }
      }
    }

    // ─── Créer le véhicule avec les images ───────────────────────────

    const vehicle = await prisma.vehicle.create({
      data: {
        ...validData,
        slug,
        publishedAt: validData.status === "PUBLISHED" ? new Date() : null,
        // Créer les images en même temps (si présentes)
        ...(uploadedImages.length > 0 && {
          images: {
            create: uploadedImages.map((img, index) => ({
              url: img.url,
              publicId: img.publicId,
              position: index,
              isMain: index === 0, // La première image est l'image principale
              alt: `${validData.marque} ${validData.modele} - Photo ${index + 1}`,
            })),
          },
        }),
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
      imagesCount: vehicle.images.length,
    });

    return NextResponse.json(
      {
        success: true,
        message: uploadedImages.length > 0 
          ? `Véhicule créé avec succès avec ${uploadedImages.length} image(s)` 
          : "Véhicule créé avec succès",
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
      { 
        error: "Erreur lors de la création du véhicule",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}