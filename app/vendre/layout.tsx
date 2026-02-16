import type { Metadata } from 'next';

/**
 * Metadata SEO optimisées - Page Vendre / Rachat
 * 
 * Cette page permet aux utilisateurs de vendre leur véhicule avec :
 * - Formulaire en 3 étapes
 * - Estimation gratuite
 * - Upload de photos
 * 
 * Metadata optimisées pour :
 * - Requêtes de vente/rachat (vendre voiture, estimation gratuite)
 * - SEO local (Nantes, Pays de la Loire)
 * - Conversion (gratuit, sans engagement, rapide)
 */
export const metadata: Metadata = {
  title: 'Vendre sa Voiture - Estimation Gratuite & Rachat Immédiat | VL Automobiles',
  description:
    'Vendez votre voiture rapidement à Nantes et dans les Pays de la Loire. Estimation gratuite en 24h, paiement immédiat, reprise garantie. Formulaire simple en 3 étapes. Toutes démarches administratives prises en charge par VL Automobiles.',
  
  keywords: [
    // Mots-clés principaux
    'vendre voiture Nantes',
    'vendre ma voiture',
    'rachat voiture Nantes',
    'estimation voiture gratuite',
    'reprise voiture Nantes',
    'vendre voiture rapidement',
    
    // Actions spécifiques
    'estimation voiture en ligne',
    'vendre voiture occasion Nantes',
    'reprise voiture occasion',
    'rachat véhicule Loire-Atlantique',
    'vendre auto Pays de la Loire',
    
    // Par marque (populaires)
    'vendre Peugeot Nantes',
    'vendre Citroën Nantes',
    'vendre Renault Nantes',
    'reprise véhicule toutes marques',
    
    // Avantages
    'estimation gratuite voiture',
    'rachat voiture paiement immédiat',
    'vendre voiture sans engagement',
    'estimation voiture 24h',
    'reprise garantie voiture',
    'démarches administratives incluses',
    
    // Longue traîne
    'comment vendre sa voiture Nantes',
    'meilleur prix rachat voiture',
    'vendre voiture bon état',
  ].join(', '),
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.vl-automobiles.fr/vendre',
    siteName: 'VL Automobiles',
    title: 'Vendez Votre Voiture Facilement - Estimation Gratuite | VL Automobiles',
    description:
      'Estimation gratuite en 24h, paiement immédiat, reprise garantie. Formulaire simple en 3 étapes. Démarches administratives prises en charge.',
    images: [
      {
        url: '/images/og-image-sell.png', // À créer
        width: 1200,
        height: 630,
        alt: 'Vendez votre voiture avec VL Automobiles',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Vendez Votre Voiture Facilement | VL Automobiles',
    description:
      'Estimation gratuite en 24h, paiement immédiat, reprise garantie. Formulaire simple en 3 étapes.',
    images: ['/images/og-image-sell.png'],
  },
  
  // Canonical URL
  alternates: {
    canonical: 'https://www.vl-automobiles.fr/vendre',
  },
  
  // Autres
  other: {
    'og:locale': 'fr_FR',
  },
};

/**
 * Layout pour la page Vendre
 * Permet d'ajouter des metadata à une page Client Component
 */
export default function VendreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}