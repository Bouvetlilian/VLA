"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const images = [
  {
    src: "/images/valentin_bouvet.jpg",
    alt: "Valentin - Co-fondateur VL Automobiles",
  },
  {
    src: "/images/Lilian.jpg",
    alt: "Lilian - Co-fondateur VL Automobiles",
  },
];

export default function AboutSection() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setVisible(false);

      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        // Fade in
        setVisible(true);
      }, 600); // durée du fade out avant de changer l'image
    }, 4000); // délai entre chaque slide

    return () => clearInterval(interval);
  }, []);

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
                Fort de plus de 10 ans d'expérience dans le secteur automobile,
                Valentin a construit son expertise au sein d'une concession
                Peugeot, où il a accompagné des centaines de clients dans leurs
                projets d'achat et de vente. Son expérience lui permet
                aujourd'hui de sélectionner rigoureusement chaque véhicule et de
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

          {/* Carrousel */}
          <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={images[current].src}
              alt={images[current].alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 0.6s ease-in-out",
              }}
            />

            {/* Indicateurs (points) */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setVisible(false);
                    setTimeout(() => {
                      setCurrent(index);
                      setVisible(true);
                    }, 600);
                  }}
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor:
                      index === current
                        ? "#FF8633"
                        : "rgba(255,255,255,0.6)",
                    transform: index === current ? "scale(1.3)" : "scale(1)",
                  }}
                  aria-label={`Voir photo ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}