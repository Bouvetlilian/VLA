import type { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import StructuredData from '@/components/StructuredData';
import {
  generateLocalBusinessLD,
  generateOrganizationLD,
  generateWebSiteLD,
} from '@/lib/seo/structured-data';

/**
 * Metadata SEO optimisées - Page d'accueil
 * 
 * Cette page est la vitrine principale du site.
 * Les metadata sont optimisées pour :
 * - Référencement local (Nantes, Pays de la Loire)
 * - Mots-clés principaux (mandataire automobile, achat/vente véhicules)
 * - Conversion (USP : accompagnement personnalisé, expertise, transparence)
 */
export const metadata: Metadata = {
  title: 'Mandataire Automobile Nantes - Achat & Vente de Véhicules | VL Automobiles',
  description:
    'VL Automobiles, mandataire automobile à Nantes et dans les Pays de la Loire. Achat de véhicules neufs et occasions au meilleur prix. Vente et reprise de votre voiture avec estimation gratuite. Accompagnement personnalisé, expertise et transparence garanties.',
  
  keywords: [
    // Mots-clés principaux
    'mandataire automobile Nantes',
    'mandataire auto Pays de la Loire',
    'achat voiture neuve Nantes',
    'achat voiture occasion Loire-Atlantique',
    'vente voiture Nantes',
    'estimation voiture gratuite',
    'reprise voiture Nantes',
    
    // Mots-clés secondaires
    'voiture familiale pas cher',
    'mandataire auto fiable',
    'économiser achat voiture',
    'meilleur prix voiture neuve',
    'accompagnement achat voiture',
    
    // Marques populaires (famille)
    'Peugeot Nantes',
    'Citroën Nantes',
    'Renault Nantes',
    'voiture neuve pas cher Nantes',
  ].join(', '),
  
  // Open Graph spécifique à l'accueil
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.vl-automobiles.fr',
    siteName: 'VL Automobiles',
    title: 'VL Automobiles - Votre Mandataire Automobile à Nantes',
    description:
      'Trouvez votre véhicule idéal au meilleur prix. Accompagnement personnalisé de A à Z. Plus de 10 ans d\'expertise automobile.',
    images: [
      {
        url: '/images/og-image-home.png', // Image spécifique homepage (à créer)
        width: 1200,
        height: 630,
        alt: 'VL Automobiles - Mandataire Automobile Nantes',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'VL Automobiles - Votre Mandataire Automobile à Nantes',
    description:
      'Trouvez votre véhicule idéal au meilleur prix. Accompagnement personnalisé de A à Z.',
    images: ['/images/og-image-home.png'],
  },
  
  // Canonical URL
  alternates: {
    canonical: 'https://www.vl-automobiles.fr',
  },
  
  // Autres informations
  other: {
    'og:locale': 'fr_FR',
    'geo.region': 'FR-44',
    'geo.placename': 'Nantes',
  },
};

/**
 * Homepage Component
 * Composant principal de la page d'accueil
 * 
 * Inclut les données structurées JSON-LD pour :
 * - LocalBusiness (entreprise locale)
 * - Organization (marque)
 * - WebSite (recherche Google)
 */
export default function HomePage() {
  return (
    <>
      {/* Structured Data JSON-LD */}
      <StructuredData data={generateLocalBusinessLD()} />
      <StructuredData data={generateOrganizationLD()} />
      <StructuredData data={generateWebSiteLD()} />
      
      {/* Contenu de la page */}
      <HeroSection />
      <AboutSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}