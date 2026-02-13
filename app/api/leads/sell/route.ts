import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSellLeadSchema } from "@/lib/validations/lead";

/**
 * POST /api/leads/sell
 * Crée une nouvelle demande de vente depuis le formulaire 3 étapes
 * Public (pas d'authentification requise)
 * 
 * Note: Pour l'instant, les photos ne sont pas gérées (upload Cloudinary à implémenter)
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer le body de la requête
    const body = await request.json();

    // Valider les données avec Zod
    const validationResult = createSellLeadSchema.safeParse(body);

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

    // Créer le lead en base de données
    const lead = await prisma.sellLead.create({
      data: {
        // Étape 1 : Infos véhicule
        marque: data.marque,
        modele: data.modele,
        annee: data.annee,
        kilometrage: data.kilometrage,
        carburant: data.carburant,
        boite: data.boite,

        // Étape 2 : État du véhicule
        etat: data.etat,
        carnet: data.carnet,
        accident: data.accident,
        commentaire: data.commentaire || null,

        // Étape 3 : Coordonnées
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
      },
    });

    // TODO (Étape 6) : Upload photos sur Cloudinary
    // if (photos && photos.length > 0) {
    //   const uploadedPhotos = await uploadPhotosToCloudinary(photos);
    //   await prisma.sellLeadPhoto.createMany({
    //     data: uploadedPhotos.map(photo => ({
    //       sellLeadId: lead.id,
    //       url: photo.url,
    //       publicId: photo.publicId,
    //     })),
    //   });
    // }

    // TODO (Étape 5) : Envoyer un email de notification à l'admin
    // await sendSellLeadNotification(lead);

    // Logger temporairement dans la console
    console.log("[LEAD VENTE] Nouveau lead créé:", {
      id: lead.id,
      vehicule: `${data.marque} ${data.modele} ${data.annee}`,
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
    });

    // Retourner le lead créé
    return NextResponse.json(
      {
        success: true,
        message: "Votre demande de rachat a bien été envoyée !",
        lead: {
          id: lead.id,
          createdAt: lead.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Erreur POST /api/leads/sell:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de votre demande" },
      { status: 500 }
    );
  }
}