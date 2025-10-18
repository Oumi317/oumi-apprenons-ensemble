import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Users, Globe, GraduationCap, CheckCircle, Star, 
  Award, TrendingUp, Calendar, Video, MessageSquare, Target,
  Play, ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
            <Link to="/tutors">
              <Button variant="ghost">Tuteurs</Button>
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

      {/* Hero Section - Style GoStudent */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div className="text-white space-y-8 animate-fade-in">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
                ✨ Rejoignez plus de 1 000 familles
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                92% des élèves progressent avec notre tutorat 1-à-1
              </h1>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-white mt-1 flex-shrink-0" />
                  <p className="text-lg text-white/90">Tuteurs certifiés et expérimentés triés sur le volet</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-white mt-1 flex-shrink-0" />
                  <p className="text-lg text-white/90">Cours personnalisés dans notre salle de classe virtuelle</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-white mt-1 flex-shrink-0" />
                  <p className="text-lg text-white/90">Horaires flexibles - apprenez quand vous voulez, d'où vous voulez</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl hover:scale-105 transition-transform">
                    Réserver un cours d'essai gratuit
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-3 text-white/90">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-white text-white" />
                  ))}
                </div>
                <span className="text-sm">Excellent - 4.8/5 basé sur 500+ avis</span>
              </div>
            </div>

            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-white/5 to-white/10 rounded-xl flex items-center justify-center">
                  <Play className="h-16 w-16 text-white" />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="font-semibold">Salle de classe interactive</p>
                      <p className="text-sm text-white/70">Rend l'apprentissage amusant et engageant</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
            <div className="space-y-2 animate-fade-in">
              <div className="text-4xl font-bold text-primary">92%</div>
              <p className="text-sm text-muted-foreground">D'élèves progressent</p>
            </div>
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl font-bold text-primary">+15</div>
              <p className="text-sm text-muted-foreground">Matières disponibles</p>
            </div>
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold text-primary">50+</div>
              <p className="text-sm text-muted-foreground">Tuteurs certifiés</p>
            </div>
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold text-primary">4.8/5</div>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
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
                <h4 className="text-xl font-bold">Familles recherchant des valeurs éthiques</h4>
                <p className="text-muted-foreground">
                  Éducation de qualité respectant vos convictions, avec des tuteurs sensibles 
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

      {/* Comment ça marche - Simplifié en 3 étapes */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Simple et efficace</Badge>
            <h3 className="text-3xl md:text-5xl font-bold mb-4">
              Commencer est aussi simple que 1-2-3
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Rejoignez notre plateforme de tutorat primée en 3 étapes faciles
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div 
              className="relative group animate-fade-in hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: '0s' }}
            >
              <Card className="border-2 hover:border-primary hover:shadow-xl transition-all h-full">
                <CardContent className="pt-8 pb-8 space-y-4 text-center">
                  <div className="h-20 w-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="h-10 w-10 text-primary" />
                  </div>
                  <div className="h-12 w-12 mx-auto -mt-2 mb-4 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    1
                  </div>
                  <h4 className="font-bold text-xl">Réservez un essai</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Partagez vos besoins d'apprentissage pour être jumelé avec le tuteur idéal, basé sur la personnalité, le niveau et les objectifs.
                  </p>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-primary to-transparent" />
            </div>

            <div 
              className="relative group animate-fade-in hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: '0.15s' }}
            >
              <Card className="border-2 hover:border-primary hover:shadow-xl transition-all h-full">
                <CardContent className="pt-8 pb-8 space-y-4 text-center">
                  <div className="h-20 w-20 mx-auto rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Video className="h-10 w-10 text-secondary" />
                  </div>
                  <div className="h-12 w-12 mx-auto -mt-2 mb-4 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    2
                  </div>
                  <h4 className="font-bold text-xl">Essayez gratuitement</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Rejoignez un cours d'essai gratuit et sans engagement. Aucune carte bancaire requise.
                  </p>
                </CardContent>
              </Card>
              <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-primary to-transparent" />
            </div>

            <div 
              className="relative group animate-fade-in hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: '0.3s' }}
            >
              <Card className="border-2 hover:border-primary hover:shadow-xl transition-all h-full">
                <CardContent className="pt-8 pb-8 space-y-4 text-center">
                  <div className="h-20 w-20 mx-auto rounded-2xl bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-10 w-10 text-success" />
                  </div>
                  <div className="h-12 w-12 mx-auto -mt-2 mb-4 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    3
                  </div>
                  <h4 className="font-bold text-xl">Commencez à apprendre</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Réservez un forfait personnalisé pour démarrer avec un plan sur mesure visant à améliorer les notes et la confiance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-gradient-primary hover:scale-105 transition-transform">
                Réserver un cours d'essai gratuit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Success Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-5xl font-bold mb-4">
              Comment nous assurons la réussite des élèves
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une approche complète pour garantir l'excellence académique
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Target,
                title: "Apprentissage personnalisé",
                description: "Chaque cours est adapté au niveau, au style d'apprentissage et aux objectifs uniques de votre enfant."
              },
              {
                icon: Award,
                title: "Tuteurs d'excellence",
                description: "Nos tuteurs sont rigoureusement sélectionnés et certifiés pour garantir la meilleure qualité d'enseignement."
              },
              {
                icon: MessageSquare,
                title: "Suivi régulier",
                description: "Rapports de progression détaillés et communication constante avec les parents."
              },
              {
                icon: BookOpen,
                title: "Programme français",
                description: "Contenu 100% aligné avec le programme de l'Éducation nationale française."
              },
              {
                icon: Video,
                title: "Classe interactive",
                description: "Outils numériques engageants : tableau blanc, partage d'écran, exercices interactifs."
              },
              {
                icon: CheckCircle,
                title: "Résultats garantis",
                description: "92% de nos élèves constatent une amélioration significative en 3 mois."
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="border hover:border-primary/50 hover:shadow-lg transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-6 space-y-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Témoignages</Badge>
            <h3 className="text-3xl md:text-5xl font-bold mb-4">
              Des familles satisfaites partout dans le monde
            </h3>
            <p className="text-lg text-muted-foreground">
              Découvrez les succès de nos élèves
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Amina K.",
                location: "Paris, France",
                text: "Ma fille a gagné 3 points de moyenne en mathématiques en seulement 2 mois ! Le tuteur est exceptionnel et très pédagogue.",
                rating: 5,
                improvement: "+3 pts en maths"
              },
              {
                name: "Mohamed B.",
                location: "Montréal, Canada",
                text: "Parfait pour maintenir le français avec nos enfants expatriés. Les horaires flexibles sont un vrai plus.",
                rating: 5,
                improvement: "Bilinguisme réussi"
              },
              {
                name: "Sarah L.",
                location: "Casablanca, Maroc",
                text: "Une plateforme qui respecte nos valeurs. Mon fils est passé de 12 à 16 de moyenne générale. Merci Oumi'School !",
                rating: 5,
                improvement: "+4 pts moyenne"
              }
            ].map((testimonial, index) => (
              <Card 
                key={index}
                className="border-2 hover:border-primary/50 hover:shadow-xl transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed">"{testimonial.text}"</p>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        {testimonial.improvement}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4">Questions fréquentes</Badge>
              <h3 className="text-3xl md:text-5xl font-bold mb-4">
                Vous avez des questions ?
              </h3>
              <p className="text-lg text-muted-foreground">
                Nous avons les réponses
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-background border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Comment fonctionne l'essai gratuit ?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  L'essai gratuit vous permet de réserver un cours de 50 minutes avec l'un de nos tuteurs certifiés. 
                  Aucune carte bancaire n'est requise et il n'y a aucun engagement. Vous pourrez discuter des besoins 
                  de votre enfant et découvrir notre plateforme interactive.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-background border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Les tuteurs sont-ils certifiés ?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Oui, tous nos tuteurs sont rigoureusement sélectionnés. Ils possèdent au minimum une licence dans 
                  leur domaine et ont une expérience pédagogique prouvée. Beaucoup sont professeurs de l'Éducation 
                  nationale ou ont des certifications spécifiques (CAPES, agrégation, etc.).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-background border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Puis-je changer de tuteur si nécessaire ?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolument ! Si le courant ne passe pas avec un tuteur, vous pouvez en changer à tout moment 
                  sans frais supplémentaires. Notre objectif est de trouver le match parfait pour votre enfant.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-background border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Les cours sont-ils conformes au programme français ?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Oui, tous nos contenus sont 100% alignés avec le programme de l'Éducation nationale française, 
                  du CP à la Terminale. Nous suivons le socle commun de connaissances et nos tuteurs adaptent 
                  leurs cours aux exigences officielles.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-background border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Quels sont les horaires disponibles ?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Nos tuteurs sont disponibles 7j/7 de 8h à 22h (heure de Paris). Nous nous adaptons également 
                  aux fuseaux horaires pour nos familles expatriées partout dans le monde.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-background border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">Puis-je annuler mon abonnement à tout moment ?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Oui, il n'y a aucun engagement de durée. Vous pouvez annuler votre abonnement à tout moment 
                  depuis votre tableau de bord. L'annulation prendra effet à la fin de votre période de facturation en cours.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">Vous avez d'autres questions ?</p>
              <Link to="/faq">
                <Button variant="outline" size="lg">
                  Voir toutes les FAQ
                </Button>
              </Link>
            </div>
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
                <li><Link to="/tutors" className="hover:text-foreground">Tuteurs</Link></li>
                <li><Link to="/lessons" className="hover:text-foreground">Ressources</Link></li>
                <li><a href="#pricing" className="hover:text-foreground">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Entreprise</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><Link to="/tutor-signup" className="hover:text-foreground">Devenir tuteur</Link></li>
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
