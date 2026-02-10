import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'VL Automobiles - Mandataire Automobile | Achat & Vente de Véhicules',
  description: 'VL Automobiles, votre mandataire automobile de confiance. Trouvez, négociez et réceptionnez votre véhicule en toute sérénité. Service personnalisé, transparent et fiable.',
  keywords: 'mandataire automobile, achat voiture, vente voiture, véhicule neuf, véhicule occasion, VL Automobiles',
  authors: [{ name: 'VL Automobiles' }],
  openGraph: {
    title: 'VL Automobiles - Mandataire Automobile',
    description: 'Trouvez, négociez et réceptionnez votre véhicule en toute sérénité',
    type: 'website',
    locale: 'fr_FR',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
