import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

/**
 * Sitemap dynamique - VL Automobiles
 * 
 * Génère automatiquement le sitemap.xml avec :
 * - Pages statiques (accueil, acheter, vendre, contact, etc.)
 * - Tous les véhicules publiés (URL dynamique par slug)
 * - Articles de blog (à ajouter plus tard)
 * 
 * Fréquences de mise à jour optimisées pour SEO
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.vl-automobiles.fr';
  
  // Date de dernière modification (maintenant)
  const now = new Date();

  // ============================================
  // 1. PAGES STATIQUES
  // ============================================
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily', // Page d'accueil mise à jour quotidiennement
      priority: 1.0, // Priorité maximale
    },
    {
      url: `${baseUrl}/acheter`,
      lastModified: now,
      changeFrequency: 'daily', // Catalogue mis à jour quotidiennement
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vendre`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/qui-sommes-nous`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/politique-confidentialite`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/donnees-personnelles`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // ============================================
  // 2. VÉHICULES PUBLIÉS (DYNAMIQUE)
  // ============================================
  let vehiclePages: MetadataRoute.Sitemap = [];
  
  try {
    // Créer une instance Prisma locale pour le sitemap
    const prisma = new PrismaClient();
    
    // Récupérer tous les véhicules publiés depuis la BDD
    const publishedVehicles = await prisma.vehicle.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Créer une entrée sitemap pour chaque véhicule
    vehiclePages = publishedVehicles.map((vehicle) => ({
      url: `${baseUrl}/acheter/${vehicle.slug}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: 'weekly' as const, // Les annonces peuvent changer (prix, km)
      priority: 0.8, // Haute priorité pour les fiches produits
    }));
    
    // Fermer la connexion Prisma
    await prisma.$disconnect();
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap (véhicules):', error);
    // Continuer même si erreur BDD (sitemap partiel)
  }

  // ============================================
  // 3. BLOG (À AJOUTER PLUS TARD)
  // ============================================
  // Décommenter quand le blog sera créé
  /*
  let blogPages: MetadataRoute.Sitemap = [];
  
  try {
    const blogPosts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });

    blogPages = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Erreur sitemap blog:', error);
  }
  */

  // ============================================
  // 4. LANDING PAGES GÉOGRAPHIQUES (OPTIONNEL)
  // ============================================
  // À ajouter si on crée ces pages
  /*
  const geoPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/mandataire-automobile-nantes`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mandataire-automobile-pays-de-loire`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
  */

  // ============================================
  // FUSION ET RETOUR
  // ============================================
  return [
    ...staticPages,
    ...vehiclePages,
    // ...blogPages, // Décommenter quand blog créé
    // ...geoPages,  // Décommenter si landing pages créées
  ];
}