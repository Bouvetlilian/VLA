import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSellLeadSchema } from "@/lib/validations/lead";
import { sendAdminNotification } from "@/lib/email/resend";
import { generateSellLeadEmail } from "@/lib/email/templates/new-sell-lead";
import { uploadImage, isCloudinaryConfigured } from "@/lib/upload/cloudinary";

/**
 * POST /api/leads/sell
 * Crée une nouvelle demande de vente depuis le formulaire 3 étapes
 * Public (pas d'authentification requise)
 * 
 * Accepte JSON ou FormData avec photos
 */
export async function POST(request: NextRequest) {
  try {
    // Détecter le type de contenu
    const contentType = request.headers.get("content-type") || "";
    const isFormData = contentType.includes("multipart/form-data");

    let data: any;
    let photoFiles: File[] = [];

    if (isFormData) {
      // ─── Mode FormData avec photos ───────────────────────────────────
      
      const formData = await request.formData();

      // Extraire les données du lead
      data = {
        // Étape 1 : Infos véhicule
        marque: formData.get("marque") as string,
        modele: formData.get("modele") as string,
        annee: parseInt(formData.get("annee") as string),
        kilometrage: parseInt(formData.get("kilometrage") as string),
        carburant: formData.get("carburant") as string,
        boite: formData.get("boite") as string,

        // Étape 2 : État du véhicule
        etat: formData.get("etat") as string,
        carnet: formData.get("carnet") as string,
        accident: formData.get("accident") as string,
        commentaire: (formData.get("commentaire") as string) || null,

        // Étape 3 : Coordonnées
        prenom: formData.get("prenom") as string,
        nom: formData.get("nom") as string,
        email: formData.get("email") as string,
        telephone: formData.get("telephone") as string,
      };

      // Récupérer les fichiers photos
      photoFiles = formData.getAll("photos") as File[];

    } else {
      // ─── Mode JSON (ancien comportement) ─────────────────────────────
      data = await request.json();
    }

    // Valider les données avec Zod
    const validationResult = createSellLeadSchema.safeParse(data);

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

    // Créer le lead en base de données
    const lead = await prisma.sellLead.create({
      data: {
        // Étape 1 : Infos véhicule
        marque: validData.marque,
        modele: validData.modele,
        annee: validData.annee,
        kilometrage: validData.kilometrage,
        carburant: validData.carburant,
        boite: validData.boite,

        // Étape 2 : État du véhicule
        etat: validData.etat,
        carnet: validData.carnet,
        accident: validData.accident,
        commentaire: validData.commentaire || null,

        // Étape 3 : Coordonnées
        prenom: validData.prenom,
        nom: validData.nom,
        email: validData.email,
        telephone: validData.telephone,
      },
    });

    // ─── Upload des photos sur Cloudinary (si présentes) ─────────────

    const uploadedPhotos: Array<{ url: string; publicId: string }> = [];

    if (photoFiles.length > 0 && isCloudinaryConfigured()) {
      console.log(`[LEAD VENTE] Upload de ${photoFiles.length} photos sur Cloudinary...`);
      
      for (const file of photoFiles) {
        if (file.size > 0) { // Vérifier que ce n'est pas un fichier vide
          try {
            const result = await uploadImage(file, "sell-leads");
            uploadedPhotos.push(result);
          } catch (error) {
            console.error("[LEAD VENTE] Erreur upload photo:", error);
            // On continue même si une photo échoue
          }
        }
      }

      // Créer les entrées sell_lead_photos en base
      if (uploadedPhotos.length > 0) {
        await prisma.sellLeadPhoto.createMany({
          data: uploadedPhotos.map((photo) => ({
            sellLeadId: lead.id,
            url: photo.url,
            publicId: photo.publicId,
          })),
        });
      }
    }

    // ─── Envoyer l'email de notification à l'admin ───────────────────

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
        `Nouvelle demande de rachat - ${validData.marque} ${validData.modele} ${validData.annee}`,
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
      vehicule: `${validData.marque} ${validData.modele} ${validData.annee}`,
      prenom: validData.prenom,
      nom: validData.nom,
      email: validData.email,
      telephone: validData.telephone,
      photosCount: uploadedPhotos.length,
    });

    // Retourner le lead créé
    return NextResponse.json(
      {
        success: true,
        message: uploadedPhotos.length > 0
          ? `Votre demande de rachat a bien été envoyée avec ${uploadedPhotos.length} photo(s) !`
          : "Votre demande de rachat a bien été envoyée !",
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