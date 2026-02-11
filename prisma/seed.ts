// prisma/seed.ts
// ─────────────────────────────────────────────────────────────────────────────
// Script d'initialisation de la base de données
// Crée le premier compte Super Admin + véhicules de démonstration
//
// Usage : npx prisma db seed
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient, Carburant, Boite, VehicleStatus, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initialisation de la base de données VL Automobiles...\n");

  // ── 1. Créer le Super Admin ───────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@vl-automobiles.fr";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "VLA_Admin_2024!";

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.admin.create({
      data: {
        email: adminEmail,
        name: "Administrateur VLA",
        password: hashedPassword,
        role: AdminRole.SUPER_ADMIN,
        twoFactorEnabled: false,
        isActive: true,
      },
    });

    console.log(`✅ Super Admin créé`);
    console.log(`   Email    : ${adminEmail}`);
    console.log(`   Mot de passe : ${adminPassword}`);
    console.log(`   ⚠️  Changer le mot de passe après la première connexion !\n`);
  } else {
    console.log(`ℹ️  Admin ${adminEmail} déjà existant — ignoré\n`);
  }

  // ── 2. Véhicules de démonstration ─────────────────────────────────────────
  const existingVehicles = await prisma.vehicle.count();

  if (existingVehicles === 0) {
    const vehicles = [
      {
        slug: "bmw-serie-3-2022",
        marque: "BMW",
        modele: "Série 3",
        annee: 2022,
        version: "320d xDrive Sport",
        kilometrage: 28000,
        prix: 38500,
        carburant: Carburant.DIESEL,
        boite: Boite.AUTOMATIQUE,
        puissance: "190 ch",
        couleur: "Noir Saphir Métallisé",
        portes: 4,
        places: 5,
        description:
          "Superbe BMW Série 3 en parfait état, entretien exclusivement chez BMW. Équipée du Pack M Sport, caméra 360°, sièges chauffants, affichage tête haute. Véhicule de direction, suivi rigoureux.",
        options: ["Pack M Sport", "Caméra 360°", "Sièges chauffants", "Affichage tête haute", "Apple CarPlay"],
        status: VehicleStatus.PUBLISHED,
        badge: "Coup de cœur",
        featured: true,
        publishedAt: new Date(),
        images: {
          create: [
            { url: "/images/hero-bg.jpg", isMain: true, position: 0, alt: "BMW Série 3 - Vue avant" },
            { url: "/images/cta-bg.jpg", isMain: false, position: 1, alt: "BMW Série 3 - Vue intérieure" },
          ],
        },
      },
      {
        slug: "mercedes-classe-c-2021",
        marque: "Mercedes",
        modele: "Classe C",
        annee: 2021,
        version: "C220d AMG Line",
        kilometrage: 45000,
        prix: 34900,
        carburant: Carburant.DIESEL,
        boite: Boite.AUTOMATIQUE,
        puissance: "200 ch",
        couleur: "Blanc Polaire",
        portes: 4,
        places: 5,
        description:
          "Mercedes Classe C AMG Line, finition premium. Toit ouvrant panoramique, système MBUX avec écran tactile 12.3\", assistant de conduite actif. Idéale pour les longs trajets.",
        options: ["Toit panoramique", "MBUX", "Aide au stationnement", "Jantes AMG 19\""],
        status: VehicleStatus.PUBLISHED,
        badge: null,
        featured: false,
        publishedAt: new Date(),
        images: {
          create: [
            { url: "/images/cta-bg.jpg", isMain: true, position: 0, alt: "Mercedes Classe C" },
          ],
        },
      },
      {
        slug: "tesla-model-3-2023",
        marque: "Tesla",
        modele: "Model 3",
        annee: 2023,
        version: "Performance",
        kilometrage: 9800,
        prix: 42000,
        carburant: Carburant.ELECTRIQUE,
        boite: Boite.AUTOMATIQUE,
        puissance: "358 ch",
        couleur: "Rouge Multi-Couches",
        portes: 4,
        places: 5,
        description:
          "Tesla Model 3 Performance quasi-neuve. 0 à 100 km/h en 3,3s. Autonomie WLTP 547km. Superchargeur gratuit pendant 1 an inclus. Autopilot complet activé.",
        options: ["Autopilot complet", "Toit vitré panoramique", "Pack Performance", "Son Premium"],
        status: VehicleStatus.PUBLISHED,
        badge: "Nouveau",
        featured: true,
        publishedAt: new Date(),
        images: {
          create: [
            { url: "/images/hero-bg.jpg", isMain: true, position: 0, alt: "Tesla Model 3 Performance" },
          ],
        },
      },
    ];

    for (const vehicle of vehicles) {
      await prisma.vehicle.create({ data: vehicle });
    }

    console.log(`✅ ${vehicles.length} véhicules de démonstration créés\n`);
  } else {
    console.log(`ℹ️  ${existingVehicles} véhicule(s) déjà en base — ignorés\n`);
  }

  // ── 3. Leads de démonstration ─────────────────────────────────────────────
  const existingLeads = await prisma.buyLead.count();

  if (existingLeads === 0) {
    const bmw = await prisma.vehicle.findUnique({ where: { slug: "bmw-serie-3-2022" } });

    if (bmw) {
      await prisma.buyLead.createMany({
        data: [
          {
            vehicleId: bmw.id,
            prenom: "Thomas",
            telephone: "06 12 34 56 78",
            message: "Bonjour, je suis intéressé par la BMW. Pouvez-vous me rappeler en fin d'après-midi ?",
            status: "NEW",
          },
          {
            vehicleId: bmw.id,
            prenom: "Sophie",
            telephone: "07 98 76 54 32",
            status: "IN_PROGRESS",
          },
        ],
      });
    }

    await prisma.sellLead.create({
      data: {
        marque: "Peugeot",
        modele: "308",
        annee: 2019,
        kilometrage: 87000,
        carburant: "Diesel",
        boite: "Manuelle",
        etat: "Bon",
        carnet: "Complet",
        accident: "Aucun accident",
        commentaire: "Quelques rayures sur le pare-chocs arrière, sinon parfait état.",
        prenom: "Marc",
        nom: "Dupont",
        email: "marc.dupont@email.com",
        telephone: "06 55 44 33 22",
        status: "NEW",
      },
    });

    console.log(`✅ Leads de démonstration créés\n`);
  }

  console.log("🎉 Base de données initialisée avec succès !");
  console.log("   → Accéder au back office : http://localhost:3000/admin");
  console.log("   → Prisma Studio         : npx prisma studio\n");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });