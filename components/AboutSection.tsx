import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 bg-vla-beige">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Texte */}
          <div>
            <h2 className="font-black text-3xl md:text-5xl mb-6">
              VL Automobile, une histoire de passion et de confiance
            </h2>

            <div className="space-y-4 text-base md:text-lg">
              <p>
                <strong>
                  VL Automobiles, c&apos;est avant tout l&apos;histoire de deux
                  frères, Valentin et Lilian.
                </strong>{" "}
                Réunis par une passion commune pour l&apos;automobile et le
                service client.
              </p>

              <p>
                Fort de plus de 10 ans d’expérience dans le secteur automobile,
                Valentin a construit son expertise au sein d’une concession
                Peugeot, où il a accompagné des centaines de clients dans leurs
                projets d’achat et de vente. Son expérience lui permet
                aujourd’hui de sélectionner rigoureusement chaque véhicule et de
                négocier les meilleures opportunités pour ses clients.
              </p>

              <p>
                Lilian complète cette expertise avec sa maîtrise du marketing
                digital et de la communication. Il met en valeur chaque
                véhicule, gère la visibilité en ligne et garantit une
                présentation claire, transparente et professionnelle.
              </p>

              <p>
                Ensemble, ils ont créé VL Automobiles avec une ambition simple :
                proposer un accompagnement personnalisé, transparent et fiable
                pour permettre à chaque client d&apos;acheter ou de vendre son
                véhicule en toute sérénité.
              </p>

              <p>
                <strong>
                  Chez VL Automobiles, chaque projet est unique, et chaque
                  client bénéficie d&apos;un suivi complet, de la recherche du
                  véhicule jusqu&apos;à la remise des clés.
                </strong>
              </p>
            </div>
          </div>

          {/* Photo */}
          <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/valentin_bouvet.jpg"
              alt="Valentin - Fondateur VL Automobiles"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
