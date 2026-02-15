import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSellLeadSchema } from "@/lib/validations/lead";
import { sendAdminNotification } from "@/lib/email/resend";
import { generateSellLeadEmail } from "@/lib/email/templates/new-sell-lead";

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

    // Envoyer l'email de notification à l'admin
    try {
      const emailHtml = generateSellLeadEmail({
        lead: {
          id: lead.id,
          marque: lead.marque,
          modele: lead.modele,
          annee: lead.annee,
          kilometrage: lead.kilometrage,
          carburant: lead.carburant,
          boite: lead.boite,
          etat: lead.etat,
          carnet: lead.carnet,
          accident: lead.accident,
          commentaire: lead.commentaire,
          prenom: lead.prenom,
          nom: lead.nom,
          email: lead.email,
          telephone: lead.telephone,
          createdAt: lead.createdAt,
        },
      });

      const emailResult = await sendAdminNotification(
        `Nouvelle demande de rachat - ${data.marque} ${data.modele} ${data.annee}`,
        emailHtml,
        "new_sell_lead",
        lead.id
      );

      if (emailResult.success) {
        console.log("[LEAD VENTE] Email envoyé avec succès:", emailResult.messageId);
        
        // Mettre à jour le lead avec la date d'envoi
        await prisma.sellLead.update({
          where: { id: lead.id },
          data: { emailSentAt: new Date() },
        });
      } else {
        console.error("[LEAD VENTE] Échec envoi email:", emailResult.error);
      }
    } catch (emailError) {
      // L'erreur d'email ne doit pas bloquer la création du lead
      console.error("[LEAD VENTE] Exception lors de l'envoi d'email:", emailError);
    }

    // Logger dans la console
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