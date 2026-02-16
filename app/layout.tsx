import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from './providers';
import StructuredData from '@/components/StructuredData';
import { generateOrganizationLD } from '@/lib/seo/structured-data';

/**
 * Metadata globales du site - VL Automobiles
 * 
 * Ces metadata servent de fallback pour toutes les pages qui n'ont pas
 * de metadata spécifiques. Elles incluent :
 * - Title et description de base
 * - Open Graph pour partages sociaux
 * - Twitter Cards
 * - Informations de contact (JSON-LD)
 */
export const metadata: Metadata = {
  // ── Metadata de base ─────────────────────────────────────────────────
  title: {
    default: 'VL Automobiles - Mandataire Automobile Nantes | Achat & Vente de Véhicules',
    template: '%s | VL Automobiles', // Pour les pages enfants : "Titre de la page | VL Automobiles"
  },
  description:
    'VL Automobiles, votre mandataire automobile de confiance dans les Pays de la Loire. Achat et vente de véhicules neufs et occasions avec accompagnement personnalisé. Expertise, transparence, prix juste.',
  
  // ── Configuration de base ────────────────────────────────────────────
  metadataBase: new URL('https://www.vl-automobiles.fr'),
  
  // ── Mots-clés globaux ────────────────────────────────────────────────
  keywords: [
    'mandataire automobile',
    'mandataire auto Nantes',
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
    'expertise automobile',
    'transparence prix voiture',
  ].join(', '),
  
  // ── Auteur et créateur ───────────────────────────────────────────────
  authors: [{ name: 'VL Automobiles' }],
  creator: 'VL Automobiles',
  publisher: 'VL Automobiles',
  
  // ── Robots (indexation) ──────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // ── Open Graph (Facebook, LinkedIn) ──────────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.vl-automobiles.fr',
    siteName: 'VL Automobiles',
    title: 'VL Automobiles - Mandataire Automobile Nantes',
    description:
      'Votre mandataire automobile de confiance dans les Pays de la Loire. Accompagnement personnalisé pour l\'achat et la vente de véhicules.',
    images: [
      {
        url: '/images/og-image.png', // À créer : 1200x630px
        width: 1200,
        height: 630,
        alt: 'VL Automobiles - Mandataire Automobile Nantes',
      },
    ],
  },
  
  // ── Twitter Card ─────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'VL Automobiles - Mandataire Automobile Nantes',
    description:
      'Votre mandataire automobile de confiance dans les Pays de la Loire. Accompagnement personnalisé.',
    images: ['/images/og-image.png'],
    creator: '@VLAutomobiles', // À créer si compte Twitter
  },
  
  // ── Informations de vérification ─────────────────────────────────────
  verification: {
    // À ajouter après création des comptes
    // google: 'code-verification-google',
    // yandex: 'code-verification-yandex',
    // bing: 'code-verification-bing',
  },
  
  // ── Autres metadata ──────────────────────────────────────────────────
  category: 'automotive',
  
  // ── Géolocalisation (SEO local) ──────────────────────────────────────
  other: {
    'geo.region': 'FR-44', // Code ISO 3166-2 Loire-Atlantique
    'geo.placename': 'Nantes',
    'geo.position': '47.218371;-1.553621', // Coordonnées Nantes (à ajuster)
    'ICBM': '47.218371, -1.553621',
  },
};

/**
 * Viewport configuration
 * Définit le comportement responsive et le zoom
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Permet zoom jusqu'à 500% (accessibilité)
  userScalable: true,
};

/**
 * Root Layout
 * Layout principal du site avec Header, Footer et Providers
 * 
 * Inclut Organization structured data sur toutes les pages
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Organization Structured Data (présent sur toutes les pages) */}
        <StructuredData data={generateOrganizationLD()} />
      </head>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}