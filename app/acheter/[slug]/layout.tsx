import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import StructuredData from '@/components/StructuredData';
import { generateVehicleProductLD, generateBreadcrumbLD } from '@/lib/seo/structured-data';
import { generateVehicleMetadata } from '@/lib/seo/metadata';

/**
 * Layout pour la page détail véhicule
 * 
 * Permet d'ajouter :
 * - Metadata dynamiques (title, description, OG avec prix/km)
 * - Structured Data Product (rich snippets Google)
 * - Breadcrumb (fil d'Ariane)
 * 
 * à une page Client Component
 */

/**
 * Generate Metadata dynamiquement pour chaque véhicule
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prisma = new PrismaClient();

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      select: {
        marque: true,
        modele: true,
        annee: true,
        prix: true,
        kilometrage: true,
        carburant: true,
        description: true,
        images: {
          where: { isMain: true },
          select: { url: true },
          take: 1,
        },
      },
    });

    await prisma.$disconnect();

    if (!vehicle) {
      return {
        title: 'Véhicule introuvable',
        description: 'Ce véhicule n\'est pas disponible.',
      };
    }

    // Utiliser le helper de metadata
    return generateVehicleMetadata({
      marque: vehicle.marque,
      modele: vehicle.modele,
      annee: vehicle.annee,
      prix: vehicle.prix,
      kilometrage: vehicle.kilometrage,
      carburant: vehicle.carburant,
      slug,
      image: vehicle.images[0]?.url,
      description: vehicle.description,
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    await prisma.$disconnect();
    return {
      title: 'Erreur',
      description: 'Impossible de charger les informations du véhicule.',
    };
  }
}

/**
 * Layout Component
 */
export default async function VehicleDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prisma = new PrismaClient();

  try {
    // Charger le véhicule pour les structured data
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      select: {
        marque: true,
        modele: true,
        annee: true,
        prix: true,
        kilometrage: true,
        carburant: true,
        boite: true,
        description: true,
        images: {
          select: { url: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    await prisma.$disconnect();

    if (!vehicle) {
      notFound();
    }

    // Préparer les données pour Product structured data
    const vehicleData = {
      marque: vehicle.marque,
      modele: vehicle.modele,
      annee: vehicle.annee,
      prix: vehicle.prix,
      kilometrage: vehicle.kilometrage,
      carburant: vehicle.carburant,
      boite: vehicle.boite,
      slug,
      description: vehicle.description,
      images: vehicle.images.map((img) => img.url),
    };

    // Breadcrumb data
    const breadcrumbItems = [
      { name: 'Accueil', url: '/' },
      { name: 'Acheter', url: '/acheter' },
      { name: `${vehicle.marque} ${vehicle.modele}`, url: `/acheter/${slug}` },
    ];

    return (
      <>
        {/* Structured Data JSON-LD */}
        <StructuredData data={generateVehicleProductLD(vehicleData)} />
        <StructuredData data={generateBreadcrumbLD(breadcrumbItems)} />

        {/* Page content (Client Component) */}
        {children}
      </>
    );
  } catch (error) {
    console.error('Error in VehicleDetailLayout:', error);
    await prisma.$disconnect();
    notFound();
  }
}