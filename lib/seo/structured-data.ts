/**
 * Structured Data Generators (JSON-LD)
 * 
 * Fonctions pour générer des données structurées Schema.org
 * qui aident Google à mieux comprendre le contenu du site
 * et à afficher des rich snippets dans les résultats de recherche.
 * 
 * Formats supportés :
 * - LocalBusiness (entreprise locale)
 * - Product (véhicules)
 * - Organization (marque VL Automobiles)
 * - BreadcrumbList (fil d'Ariane)
 * - FAQPage (questions fréquentes)
 */

import { SITE_CONFIG } from './metadata';

// ============================================
// TYPES
// ============================================

interface VehicleData {
  marque: string;
  modele: string;
  annee: number;
  prix: number;
  kilometrage: number;
  carburant: string;
  boite: string;
  description?: string;
  images?: string[];
  slug: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

// ============================================
// LOCAL BUSINESS (Entreprise locale)
// ============================================

/**
 * Génère le JSON-LD pour LocalBusiness
 * À utiliser sur la page d'accueil et les pages de contact
 * 
 * Inclut :
 * - Informations NAP (Name, Address, Phone)
 * - Horaires d'ouverture
 * - Zone de service
 * - Coordonnées GPS
 * - Réseaux sociaux
 */
export function generateLocalBusinessLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    '@id': `${SITE_CONFIG.url}#business`,
    name: SITE_CONFIG.company.name,
    legalName: SITE_CONFIG.company.legalName,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}${SITE_CONFIG.images.logo}`,
    image: `${SITE_CONFIG.url}${SITE_CONFIG.images.ogImage}`,
    
    // Localisation
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.company.address.street,
      addressLocality: SITE_CONFIG.company.address.city,
      addressRegion: SITE_CONFIG.company.address.region,
      postalCode: SITE_CONFIG.company.address.postalCode,
      addressCountry: SITE_CONFIG.company.address.country,
    },
    
    // Coordonnées GPS (Nantes centre)
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 47.218371,
      longitude: -1.553621,
    },
    
    // Zone de service
    areaServed: [
      {
        '@type': 'City',
        name: 'Nantes',
      },
      {
        '@type': 'State',
        name: 'Pays de la Loire',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Loire-Atlantique',
      },
    ],
    
    // Contact
    telephone: SITE_CONFIG.company.phone,
    email: SITE_CONFIG.company.email,
    
    // Horaires d'ouverture
    openingHoursSpecification: SITE_CONFIG.company.openingHours.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.split(' ')[0] === 'Mo-Fr'
        ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        : ['Saturday'],
      opens: hours.split(' ')[1].split('-')[0],
      closes: hours.split(' ')[1].split('-')[1],
    })),
    
    // Prix moyen (estimation)
    priceRange: '€€',
    
    // Services proposés
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services automobiles',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Achat de véhicules neufs et occasions',
            description: 'Mandataire automobile pour l\'achat de véhicules neufs et occasions au meilleur prix',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Vente et reprise de véhicules',
            description: 'Estimation gratuite et rachat de votre véhicule sous 24h',
          },
        },
      ],
    },
    
    // Réseaux sociaux
    sameAs: [
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.linkedin,
      SITE_CONFIG.social.youtube,
    ].filter(Boolean),
  };
}

// ============================================
// ORGANIZATION (Marque)
// ============================================

/**
 * Génère le JSON-LD pour Organization
 * À utiliser sur toutes les pages pour renforcer l'identité de marque
 * 
 * Aide Google à construire le Knowledge Graph
 */
export function generateOrganizationLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}#organization`,
    name: SITE_CONFIG.company.name,
    legalName: SITE_CONFIG.company.legalName,
    url: SITE_CONFIG.url,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}${SITE_CONFIG.images.logo}`,
      width: 512,
      height: 512,
    },
    
    // Contact
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.company.phone,
      email: SITE_CONFIG.company.email,
      contactType: 'Customer Service',
      areaServed: 'FR',
      availableLanguage: ['French'],
    },
    
    // Réseaux sociaux
    sameAs: [
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.linkedin,
      SITE_CONFIG.social.youtube,
    ].filter(Boolean),
  };
}

// ============================================
// PRODUCT (Véhicule)
// ============================================

/**
 * Génère le JSON-LD pour un véhicule (Product)
 * À utiliser sur les pages de détail véhicule
 * 
 * Permet l'affichage de rich snippets avec :
 * - Prix
 * - Disponibilité
 * - Image
 * - Caractéristiques
 */
export function generateVehicleProductLD(vehicle: VehicleData) {
  const {
    marque,
    modele,
    annee,
    prix,
    kilometrage,
    carburant,
    boite,
    description,
    images = [],
    slug,
  } = vehicle;

  const vehicleName = `${marque} ${modele} ${annee}`;
  const url = `${SITE_CONFIG.url}/acheter/${slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    '@id': url,
    name: vehicleName,
    description:
      description ||
      `${vehicleName}, ${kilometrage.toLocaleString('fr-FR')} km, ${carburant}. Disponible chez VL Automobiles, mandataire automobile Nantes.`,
    
    // Images
    image: images.length > 0 ? images : [`${SITE_CONFIG.url}${SITE_CONFIG.images.ogImage}`],
    
    // Caractéristiques
    brand: {
      '@type': 'Brand',
      name: marque,
    },
    model: modele,
    productionDate: annee.toString(),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: kilometrage,
      unitCode: 'KMT', // Kilomètres
    },
    fuelType: carburant,
    vehicleTransmission: boite === 'Automatique' ? 'AutomaticTransmission' : 'ManualTransmission',
    
    // Offre (prix et disponibilité)
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'EUR',
      price: prix,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
      itemCondition: 'https://schema.org/UsedCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.company.name,
        url: SITE_CONFIG.url,
      },
    },
    
    // Vendeur
    seller: {
      '@type': 'Organization',
      name: SITE_CONFIG.company.name,
    },
  };
}

// ============================================
// BREADCRUMB LIST (Fil d'Ariane)
// ============================================

/**
 * Génère le JSON-LD pour BreadcrumbList
 * À utiliser sur toutes les pages avec navigation
 * 
 * Améliore l'affichage du fil d'Ariane dans les résultats Google
 */
export function generateBreadcrumbLD(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

// ============================================
// FAQ PAGE (Questions fréquentes)
// ============================================

/**
 * Génère le JSON-LD pour FAQPage
 * À utiliser sur les pages avec FAQ
 * 
 * Permet l'affichage dans les résultats enrichis Google
 */
export function generateFAQLD(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ============================================
// WEBSITE (Site web)
// ============================================

/**
 * Génère le JSON-LD pour WebSite
 * À utiliser sur la page d'accueil
 * 
 * Permet la recherche directe dans Google (search box)
 */
export function generateWebSiteLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}#website`,
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    publisher: {
      '@id': `${SITE_CONFIG.url}#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/acheter?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ============================================
// ITEM LIST (Liste de produits)
// ============================================

/**
 * Génère le JSON-LD pour ItemList
 * À utiliser sur la page catalogue
 * 
 * Liste tous les véhicules disponibles
 */
export function generateVehicleListLD(vehicles: VehicleData[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Véhicules disponibles',
    description: 'Catalogue de véhicules neufs et occasions chez VL Automobiles',
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((vehicle, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Car',
        name: `${vehicle.marque} ${vehicle.modele} ${vehicle.annee}`,
        url: `${SITE_CONFIG.url}/acheter/${vehicle.slug}`,
        offers: {
          '@type': 'Offer',
          price: vehicle.prix,
          priceCurrency: 'EUR',
        },
      },
    })),
  };
}