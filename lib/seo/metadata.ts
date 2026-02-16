import { Metadata } from 'next';

/**
 * Helpers SEO - Génération de metadata optimisées
 * 
 * Fonctions réutilisables pour créer des metadata riches et cohérentes
 * sur toutes les pages du site
 */

// ============================================
// CONFIGURATION GLOBALE
// ============================================

export const SITE_CONFIG = {
  name: 'VL Automobiles',
  url: 'https://www.vl-automobiles.fr',
  description:
    'VL Automobiles, votre mandataire automobile de confiance dans les Pays de la Loire. Achat et vente de véhicules neufs et occasions avec accompagnement personnalisé.',
  locale: 'fr_FR',
  type: 'website',
  
  // Informations entreprise (NAP - Name Address Phone)
  company: {
    name: 'VL Automobiles',
    legalName: 'VL Automobiles', // À mettre à jour avec raison sociale exacte
    address: {
      street: '', // À compléter
      city: 'Nantes',
      region: 'Pays de la Loire',
      postalCode: '', // À compléter
      country: 'France',
    },
    phone: '06 XX XX XX XX', // À mettre à jour
    email: 'contact@vl-automobiles.fr',
    
    // Horaires d'ouverture (format Schema.org)
    openingHours: [
      'Mo-Fr 09:00-19:00',
      'Sa 09:00-18:00',
    ],
  },
  
  // Réseaux sociaux
  social: {
    facebook: '', // À compléter si créé
    instagram: '', // À compléter si créé
    linkedin: '', // À compléter si créé
    youtube: '', // À compléter si créé
  },
  
  // Images par défaut
  images: {
    logo: '/images/logo-vla.png', // Logo original
    ogImage: '/images/og-image.png', // Image Open Graph 1200x630px
    favicon: '/favicon.ico',
  },
  
  // Mots-clés globaux
  keywords: [
    'mandataire automobile',
    'mandataire auto',
    'achat voiture neuve',
    'achat voiture occasion',
    'vente voiture',
    'estimation voiture gratuite',
    'reprise voiture',
    'Nantes',
    'Pays de la Loire',
    'Loire-Atlantique',
    'mandataire automobile Nantes',
    'voiture neuve pas cher',
    'économiser achat voiture',
    'accompagnement personnalisé',
  ],
} as const;

// ============================================
// HELPER : METADATA DE BASE
// ============================================

interface BaseMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  image?: string;
  noIndex?: boolean;
}

/**
 * Génère les metadata de base pour une page
 * Inclut : title, description, keywords, Open Graph, Twitter
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  path = '',
  image,
  noIndex = false,
}: BaseMetadataOptions): Metadata {
  const url = `${SITE_CONFIG.url}${path}`;
  const ogImage = image || SITE_CONFIG.images.ogImage;
  const fullTitle = title.includes('VL Automobiles') 
    ? title 
    : `${title} | VL Automobiles`;

  return {
    title: fullTitle,
    description,
    keywords: [...SITE_CONFIG.keywords, ...keywords].join(', '),
    
    // Configuration de base
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: url,
    },
    
    // Robots
    robots: noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    
    // Open Graph (Facebook, LinkedIn)
    openGraph: {
      type: 'website',
      locale: SITE_CONFIG.locale,
      url,
      siteName: SITE_CONFIG.name,
      title: fullTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@VLAutomobiles', // À créer si compte Twitter créé
    },
    
    // Informations supplémentaires
    authors: [{ name: SITE_CONFIG.company.name }],
    creator: SITE_CONFIG.company.name,
    publisher: SITE_CONFIG.company.name,
    
    // Langue
    other: {
      'og:locale': SITE_CONFIG.locale,
      'geo.region': 'FR-44', // Code ISO 3166-2 Loire-Atlantique
      'geo.placename': 'Nantes',
    },
  };
}

// ============================================
// HELPER : METADATA PRODUIT (VÉHICULE)
// ============================================

interface VehicleMetadataOptions {
  marque: string;
  modele: string;
  annee: number;
  prix: number;
  kilometrage: number;
  carburant: string;
  slug: string;
  image?: string;
  description?: string;
}

/**
 * Génère les metadata optimisées pour une fiche véhicule
 * Inclut des mots-clés spécifiques au véhicule
 */
export function generateVehicleMetadata({
  marque,
  modele,
  annee,
  prix,
  kilometrage,
  carburant,
  slug,
  image,
  description,
}: VehicleMetadataOptions): Metadata {
  const title = `${marque} ${modele} ${annee} - ${prix.toLocaleString('fr-FR')}€ | VL Automobiles`;
  
  const defaultDescription = 
    `${marque} ${modele} ${annee}, ${kilometrage.toLocaleString('fr-FR')} km, ${carburant}. ` +
    `Prix : ${prix.toLocaleString('fr-FR')}€. Disponible chez VL Automobiles, mandataire automobile Nantes. ` +
    `Accompagnement personnalisé et livraison soignée.`;
  
  const vehicleKeywords = [
    `${marque} ${modele}`,
    `${marque} ${modele} ${annee}`,
    `${marque} ${modele} occasion`,
    `${marque} ${modele} ${carburant}`,
    `acheter ${marque} ${modele}`,
    `${marque} ${modele} Nantes`,
    `${marque} ${modele} mandataire`,
    `prix ${marque} ${modele}`,
    carburant.toLowerCase(),
    annee.toString(),
  ];

  return generateMetadata({
    title,
    description: description || defaultDescription,
    keywords: vehicleKeywords,
    path: `/acheter/${slug}`,
    image,
  });
}

// ============================================
// HELPER : METADATA ARTICLE BLOG
// ============================================

interface BlogMetadataOptions {
  title: string;
  description: string;
  slug: string;
  image?: string;
  author?: string;
  publishedDate?: Date;
  tags?: string[];
}

/**
 * Génère les metadata pour un article de blog
 * Inclut les informations d'article (auteur, date)
 */
export function generateBlogMetadata({
  title,
  description,
  slug,
  image,
  author = SITE_CONFIG.company.name,
  publishedDate,
  tags = [],
}: BlogMetadataOptions): Metadata {
  const fullTitle = `${title} | Blog VL Automobiles`;
  const url = `${SITE_CONFIG.url}/blog/${slug}`;

  const metadata = generateMetadata({
    title: fullTitle,
    description,
    keywords: tags,
    path: `/blog/${slug}`,
    image,
  });

  // Ajouter les metadata spécifiques article
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      authors: [author],
      publishedTime: publishedDate?.toISOString(),
      tags,
    },
    authors: [{ name: author }],
  };
}

// ============================================
// HELPER : CANONICAL URL
// ============================================

/**
 * Génère l'URL canonique complète
 */
export function getCanonicalUrl(path: string): string {
  return `${SITE_CONFIG.url}${path}`;
}

// ============================================
// HELPER : FORMAT PRIX POUR SEO
// ============================================

/**
 * Formate un prix pour l'affichage dans les metadata
 */
export function formatPriceSEO(price: number): string {
  return `${price.toLocaleString('fr-FR')}€`;
}

// ============================================
// HELPER : FORMAT KILOMETRAGE POUR SEO
// ============================================

/**
 * Formate un kilométrage pour les metadata
 */
export function formatKilometrageSEO(km: number): string {
  return `${km.toLocaleString('fr-FR')} km`;
}