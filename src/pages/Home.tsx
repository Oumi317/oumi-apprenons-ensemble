import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Globe, GraduationCap, CheckCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Oumi'School
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#segments" className="text-foreground/80 hover:text-foreground transition-colors">
              Pour qui ?
            </a>
            <a href="#how-it-works" className="text-foreground/80 hover:text-foreground transition-colors">
              Comment ça marche
            </a>
            <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
              Tarifs
            </a>
            <Link to="/lessons">
              <Button variant="ghost">Ressources</Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline">Connexion</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="bg-gradient-primary">Commencer</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge className="bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20">
            Excellence éducative francophone
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            L'éducation française de qualité,
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              accessible partout dans le monde
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cours en direct avec des tuteurs certifiés et ressources pédagogiques alignées 
            avec le programme français, du CP au lycée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                Essai gratuit
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Découvrir la plateforme
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Conforme RGPD</span>
            </div>
          </div>
        </div>
      </section>

      {/* Segments Cibles */}
      <section id="segments" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Pour qui ?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Oumi'School accompagne les familles francophones du monde entier
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary transition-all hover:shadow-lg">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold">Familles IEF en France</h4>
                <p className="text-muted-foreground">
                  Accompagnement personnalisé aligné avec le socle commun de connaissances 
                  pour l'Instruction En Famille.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Suivi conforme aux exigences du rectorat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Ressources alignées programme officiel</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary transition-all hover:shadow-lg">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-secondary" />
                </div>
                <h4 className="text-xl font-bold">Expatriés francophones</h4>
                <p className="text-muted-foreground">
                  Maintenez le lien avec la culture et le système éducatif français, 
                  où que vous soyez.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Horaires adaptés à tous les fuseaux</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Préparation retour en France</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-success transition-all hover:shadow-lg">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <h4 className="text-xl font-bold">Communautés musulmanes</h4>
                <p className="text-muted-foreground">
                  Éducation de qualité respectant vos valeurs, avec des tuteurs sensibles 
                  à vos besoins spécifiques.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Environnement bienveillant</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Excellence académique</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              4 étapes simples pour commencer votre parcours éducatif
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Inscription gratuite",
                description: "Créez votre compte famille en quelques minutes"
              },
              {
                step: "2",
                title: "Découvrez nos tuteurs",
                description: "Parcourez les profils de tuteurs certifiés et expérimentés"
              },
              {
                step: "3",
                title: "Réservez un cours",
                description: "Choisissez un créneau adapté à votre emploi du temps"
              },
              {
                step: "4",
                title: "Apprenez et progressez",
                description: "Suivez les cours en visio et accédez aux ressources pédagogiques"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {item.step}
                  </div>
                  <h4 className="font-bold text-lg">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Tarifs transparents</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choisissez la formule adaptée à vos besoins
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="text-2xl font-bold mb-2">Gratuit</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">0€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">5 leçons par semaine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Accès communauté</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">1 session gratuite</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Commencer gratuitement
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-primary text-white px-3 py-1 text-xs font-bold">
                POPULAIRE
              </div>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="text-2xl font-bold mb-2">Premium Individuel</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">9,99€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Accès illimité aux leçons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">1 enfant</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Suivi personnalisé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Rapports mensuels</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-primary">
                  Choisir Premium
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="text-2xl font-bold mb-2">Premium Famille</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">24,99€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Tous les avantages Premium</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Jusqu'à 4 enfants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Remise tutorat -10%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <span className="text-sm">Support prioritaire</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Choisir Famille
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Ils nous font confiance</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Amina K.",
                location: "Paris, France",
                text: "Parfait pour notre IEF ! Les ressources sont alignées avec le programme et les tuteurs sont excellents.",
                rating: 5
              },
              {
                name: "Mohamed B.",
                location: "Montréal, Canada",
                text: "Nos enfants adorent les cours en visio. Excellente façon de maintenir le lien avec la culture française.",
                rating: 5
              },
              {
                name: "Sarah L.",
                location: "Casablanca, Maroc",
                text: "Une plateforme professionnelle qui respecte nos valeurs. Les progrès de mes enfants sont remarquables.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h3 className="text-3xl md:text-5xl font-bold text-white">
              Prêt à commencer l'aventure éducative ?
            </h3>
            <p className="text-xl text-white/90">
              Rejoignez des milliers de familles qui font confiance à Oumi'School
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform">
                  Créer mon compte gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Oumi'School</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Excellence éducative francophone pour familles du monde entier.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Plateforme</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Tuteurs</a></li>
                <li><a href="#" className="hover:text-foreground">Ressources</a></li>
                <li><a href="#" className="hover:text-foreground">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Entreprise</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">À propos</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Devenir tuteur</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Légal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">CGU</a></li>
                <li><a href="#" className="hover:text-foreground">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-foreground">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Oumi'School. Tous droits réservés. Conforme RGPD.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
