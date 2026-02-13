import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBuyLeadSchema } from "@/lib/validations/lead";
import { VehicleStatus } from "@prisma/client";

/**
 * POST /api/leads/buy
 * Crée une nouvelle demande d'achat depuis le formulaire de contact véhicule
 * Public (pas d'authentification requise)
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer le body de la requête
    const body = await request.json();

    // Valider les données avec Zod
    const validationResult = createBuyLeadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { vehicleId, prenom, telephone, message } = validationResult.data;

    // Vérifier que le véhicule existe et est publié
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, status: true, marque: true, modele: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Le véhicule spécifié n'existe pas" },
        { status: 404 }
      );
    }

    if (vehicle.status !== VehicleStatus.PUBLISHED) {
      return NextResponse.json(
        { error: "Ce véhicule n'est plus disponible" },
        { status: 400 }
      );
    }

    // Créer le lead en base de données
    const lead = await prisma.buyLead.create({
      data: {
        vehicleId,
        prenom,
        telephone,
        message: message || null,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            marque: true,
            modele: true,
            annee: true,
            slug: true,
          },
        },
      },
    });

    // TODO (Étape 5) : Envoyer un email de notification à l'admin
    // await sendBuyLeadNotification(lead);

    // Logger temporairement dans la console
    console.log("[LEAD ACHAT] Nouveau lead créé:", {
      id: lead.id,
      vehicule: `${vehicle.marque} ${vehicle.modele}`,
      prenom,
      telephone,
    });

    // Retourner le lead créé
    return NextResponse.json(
      {
        success: true,
        message: "Votre demande a bien été envoyée !",
        lead: {
          id: lead.id,
          createdAt: lead.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Erreur POST /api/leads/buy:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de votre demande" },
      { status: 500 }
    );
  }
}