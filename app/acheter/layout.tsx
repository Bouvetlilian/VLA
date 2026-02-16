import type { Metadata } from 'next';

/**
 * Metadata SEO optimisées - Page Catalogue
 * 
 * Cette page affiche tous les véhicules disponibles avec filtres avancés.
 * Metadata optimisées pour :
 * - Référencement sur requêtes génériques (achat voiture, véhicules occasions)
 * - Marques populaires (Peugeot, Citroën, Renault)
 * - Conversions (prix compétitifs, large choix)
 */
export const metadata: Metadata = {
  title: 'Acheter une Voiture - Véhicules Neufs & Occasions | VL Automobiles',
  description:
    'Découvrez notre sélection de véhicules neufs et occasions à Nantes. Peugeot, Citroën, Renault et plus encore. Filtres avancés par prix, kilométrage, carburant. Accompagnement personnalisé et meilleur prix garanti.',
  
  keywords: [
    // Mots-clés principaux
    'acheter voiture Nantes',
    'voiture neuve Nantes',
    'voiture occasion Nantes',
    'véhicule neuf Loire-Atlantique',
    'véhicule occasion Pays de la Loire',
    
    // Par marque
    'Peugeot neuve Nantes',
    'Citroën neuve Nantes',
    'Renault neuve Nantes',
    'voiture familiale Nantes',
    
    // Par critère
    'voiture essence Nantes',
    'voiture diesel Nantes',
    'voiture électrique Nantes',
    'voiture hybride Nantes',
    'voiture automatique Nantes',
    
    // Par budget
    'voiture pas cher Nantes',
    'voiture 10000 euros',
    'voiture 20000 euros',
    'meilleur prix voiture neuve',
    
    // Action
    'trouver voiture Nantes',
    'comparer prix voiture',
    'catalogue véhicules Nantes',
  ].join(', '),
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.vl-automobiles.fr/acheter',
    siteName: 'VL Automobiles',
    title: 'Acheter une Voiture - Large Sélection de Véhicules | VL Automobiles',
    description:
      'Trouvez votre véhicule idéal parmi notre large sélection. Peugeot, Citroën, Renault et plus. Filtres avancés et meilleur prix garanti.',
    images: [
      {
        url: '/images/og-image-catalog.png', // À créer
        width: 1200,
        height: 630,
        alt: 'Catalogue de véhicules VL Automobiles',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Acheter une Voiture - Large Sélection | VL Automobiles',
    description:
      'Trouvez votre véhicule idéal parmi notre large sélection. Filtres avancés et meilleur prix garanti.',
    images: ['/images/og-image-catalog.png'],
  },
  
  // Canonical URL
  alternates: {
    canonical: 'https://www.vl-automobiles.fr/acheter',
  },
  
  // Autres
  other: {
    'og:locale': 'fr_FR',
  },
};

/**
 * Layout pour la page Catalogue
 * Permet d'ajouter des metadata à une page Client Component
 */
export default function AcheterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}