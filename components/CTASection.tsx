import Image from 'next/image';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center px-6 md:px-12 overflow-hidden">
      {/* Image de fond */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/cta-bg.jpg" 
          alt="Démarrez votre expérience avec VL Automobiles"
          fill
          className="object-cover brightness-50"
          quality={90}
        />
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 max-w-7xl mx-auto w-full text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-white font-black text-4xl md:text-6xl leading-tight mb-8">
            Démarrez votre expérience avec nous dès aujourd&apos;hui.
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/acheter" 
              className="bg-vla-orange text-white px-10 py-4 rounded-lg font-semibold text-center hover:bg-opacity-90 transition-all shadow-lg text-lg"
            >
              Acheter un véhicule
            </Link>
            <Link 
              href="/vendre" 
              className="bg-white text-vla-orange px-10 py-4 rounded-lg font-semibold text-center hover:bg-opacity-90 transition-all shadow-lg text-lg"
            >
              Vendre mon véhicule
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
