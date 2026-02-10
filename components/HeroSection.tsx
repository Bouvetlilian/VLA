import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-[500px] lg:min-h-[600px] flex items-center px-6 md:px-8 lg:px-12 py-12 overflow-hidden bg-vla-beige">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-3xl overflow-hidden shadow-2xl">
          {/* Image de fond à l'intérieur du conteneur arrondi */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/hero-bg.jpg" 
              alt="Showroom VL Automobiles"
              fill
              className="object-cover opacity-60"
              priority
              quality={90}
            />
          </div>

          {/* Contenu */}
          <div className="relative z-10 px-8 md:px-12 lg:px-16 py-12 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Colonne gauche : Titre */}
              <div>
                <h1 className="text-white font-black text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight">
                  Trouver, négocier, réceptionner.
                  <br />
                  On s&apos;occupe de tout !
                </h1>
              </div>
              
              {/* Colonne droite : CTAs */}
              <div className="flex flex-col gap-4 lg:items-end lg:justify-center">
                <Link 
                  href="/acheter" 
                  className="bg-vla-orange text-white px-8 py-4 rounded-xl font-bold text-center hover:bg-opacity-90 transition-all shadow-lg text-lg w-full lg:w-auto lg:min-w-[280px]"
                >
                  Acheter un véhicule
                </Link>
                <Link 
                  href="/vendre" 
                  className="bg-white text-vla-orange px-8 py-4 rounded-xl font-bold text-center hover:bg-opacity-90 transition-all shadow-lg text-lg w-full lg:w-auto lg:min-w-[280px]"
                >
                  Vendre mon véhicule
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
