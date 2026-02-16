import { MetadataRoute } from 'next';

/**
 * Manifest PWA - VL Automobiles
 * 
 * Permet au site d'être installé comme application sur mobile
 * Améliore le SEO mobile et l'expérience utilisateur
 * 
 * Note : Les icônes devront être ajoutées dans /public/icons/
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VL Automobiles - Mandataire Automobile',
    short_name: 'VL Automobiles',
    description:
      'VL Automobiles, votre mandataire automobile de confiance dans les Pays de la Loire. Achat et vente de véhicules neufs et occasions avec accompagnement personnalisé.',
    start_url: '/',
    display: 'standalone', // Affichage plein écran comme une app
    background_color: '#F4EDDF', // Couleur beige VLA
    theme_color: '#FF8633', // Couleur orange VLA
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'fr-FR',
    dir: 'ltr',
    
    // Icônes (à générer à partir du logo)
    // TODO: Créer ces fichiers dans /public/icons/
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],

    // Catégories (aide les stores à classer l'app)
    categories: ['business', 'shopping', 'automotive'],

    // Screenshots (optionnel, pour améliorer la présentation dans les stores)
    // À ajouter plus tard si nécessaire
    /*
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '1280x720',
        type: 'image/png',
      },
      {
        src: '/screenshots/catalog.png',
        sizes: '1280x720',
        type: 'image/png',
      },
    ],
    */

    // Informations de contact
    related_applications: [],
    prefer_related_applications: false,
  };
}