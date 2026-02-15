import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'VL Automobiles - Mandataire Automobile | Achat & Vente de Véhicules',
  description:
    'VL Automobiles, votre mandataire automobile de confiance. Trouvez, négociez et réceptionnez votre véhicule en toute sérénité.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
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
