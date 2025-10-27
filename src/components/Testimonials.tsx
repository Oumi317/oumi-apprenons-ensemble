import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Sophie Martin",
      location: "Paris, France",
      text: "Ma fille de 12 ans a progressé de manière incroyable en mathématiques. Elle adore ses sessions avec son tuteur qui sait rendre les cours amusants et engageants.",
      rating: 5,
      improvement: "+3 pts de moyenne",
      avatar: "SM",
      subject: "Mathématiques",
    },
    {
      name: "Karim Benali",
      location: "Dubaï, EAU",
      text: "Expatrié à Dubaï, je cherchais un moyen de maintenir le niveau français de mes enfants. Oumi'School a été la solution parfaite. Les tuteurs sont excellents et flexibles.",
      rating: 5,
      improvement: "CP → CE1",
      avatar: "KB",
      subject: "Français",
    },
    {
      name: "Fatima Zahra",
      location: "Casablanca, Maroc",
      text: "Instruction en famille pour mes 3 enfants. Les tuteurs respectent nos valeurs et notre rythme. Le suivi pédagogique est remarquable.",
      rating: 5,
      improvement: "3 enfants",
      avatar: "FZ",
      subject: "Toutes matières",
    },
    {
      name: "Thomas Dubois",
      location: "Lyon, France",
      text: "Mon fils était en difficulté en physique-chimie. En 2 mois avec Oumi'School, il a rattrapé son retard et retrouvé confiance en lui.",
      rating: 5,
      improvement: "+4 pts moyenne",
      avatar: "TD",
      subject: "Physique-Chimie",
    },
    {
      name: "Amina Hassan",
      location: "Londres, UK",
      text: "Nous vivons à Londres et voulions que nos enfants gardent leur français. Les tuteurs sont natifs et très professionnels. Un vrai soulagement pour nous !",
      rating: 5,
      improvement: "Bilingue",
      avatar: "AH",
      subject: "Français langue maternelle",
    },
    {
      name: "Pierre Laurent",
      location: "Montpellier, France",
      text: "La préparation au brevet s'est très bien passée grâce à Oumi'School. Ma fille a eu 18/20 en maths alors qu'elle avait 11 de moyenne !",
      rating: 5,
      improvement: "Mention TB",
      avatar: "PL",
      subject: "Prépa Brevet",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            ⭐ Témoignages
          </div>
          <h3 className="text-4xl md:text-5xl font-bold mb-4">
            +1 000 familles nous font confiance
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez comment Oumi'School transforme l'apprentissage des enfants
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-6 animate-fade-in hover:shadow-xl transition-all border-2 hover:border-primary/20 relative group overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              
              {/* Rating */}
              <div className="flex gap-1 mb-4 relative">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-muted-foreground mb-6 italic leading-relaxed relative text-sm">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3 relative">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md flex-shrink-0">
                  {testimonial.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{testimonial.location}</p>
                  <p className="text-xs text-primary font-medium truncate">{testimonial.subject}</p>
                </div>
                <Badge className="bg-success/10 text-success border-success/20 text-xs flex-shrink-0">
                  {testimonial.improvement}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-secondary text-secondary" />
              ))}
            </div>
            <span className="text-xl font-bold">4.9/5</span>
          </div>
          <p className="text-muted-foreground">
            Basé sur plus de 500 avis vérifiés
          </p>
        </div>
      </div>
    </section>
  );
};
