import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: "Sophie M.",
    text: "Très satisfaite de mon expérience avec VL Automobiles ! J'ai acheté une Ford Kuga 2024 en septembre. Tout s'est déroulé parfaitement du début à la fin. Les conseils étaient clairs, sans aucune pression, et le véhicule correspondait exactement à la description. Le processus de livraison était bien préparé avec soin. Je recommande sans hésiter.",
    image: "/images/testimonial-1.jpg"
  },
  {
    id: 2,
    name: "Marc D.",
    text: "J'ai fait appel à VL Automobiles pour vendre ma Peugeot 308 et je ne regrette rien. Le service était simple et rapide. L'estimation du véhicule était cohérente et juste. La vente s'est faite dans de très bons délais. Communication claire et professionnelle. Service sérieux et efficace.",
    image: "/images/testimonial-2.avif"
  },
  {
    id: 3,
    name: "Aminata L.",
    text: "Je cherchais un Renault Scénic familial et VL Automobiles m'a su me trouver exactement ce que je recherchais. L'accompagnement, la transparence sur l'historique du véhicule et les démarches administratives gérées rapidement. Une expérience professionnelle du début à la fin. Je reviendrai pour mon prochain véhicule.",
    image: "/images/testimonial-3.avif"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-black text-3xl md:text-5xl text-center mb-16">
          Laissez nos clients vous convaincrent
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-vla-beige p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Photo */}
              <div className="flex justify-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-vla-orange">
                  <Image 
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              </div>
              
              {/* Nom */}
              <h3 className="font-black text-xl text-center mb-4">
                {testimonial.name}
              </h3>
              
              {/* Témoignage */}
              <p className="text-sm md:text-base leading-relaxed text-center">
                {testimonial.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
