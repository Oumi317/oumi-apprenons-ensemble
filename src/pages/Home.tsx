import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Users, Globe, GraduationCap, CheckCircle, Star, 
  Award, TrendingUp, Calendar, Video, MessageSquare, Target,
  Play, ChevronDown, Search, Clock, BarChart3, Shield
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

      {/* Matières Disponibles - Placé en haut pour plus de visibilité */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              📚 Nos matières
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Tutorat en ligne pour toutes les matières scolaires
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              +15 matières disponibles, tous niveaux d'apprentissage
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[
              { name: "Mathématiques", icon: "📐" },
              { name: "Français", icon: "📖" },
              { name: "Anglais", icon: "🇬🇧" },
              { name: "Sciences", icon: "🔬" },
              { name: "Histoire", icon: "🏛️" },
              { name: "Géographie", icon: "🌍" },
              { name: "Physique", icon: "⚛️" },
              { name: "Chimie", icon: "🧪" },
              { name: "Philosophie", icon: "💭" },
              { name: "Arabe", icon: "📚" }
            ].map((subject, index) => (
              <Card 
                key={index} 
                className="p-6 text-center hover:border-primary transition-all hover:shadow-lg hover:scale-105 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{subject.icon}</div>
                <h4 className="font-semibold text-sm">{subject.name}</h4>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/lessons">
              <Button variant="outline" size="lg" className="group">
                Voir toutes les matières
                <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


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
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              🚀 Simple et rapide
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Comment ça marche ?
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trois étapes simples pour démarrer votre parcours d'apprentissage
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative group animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
              <Card className="p-8 text-center h-full border-2 hover:border-primary/40 transition-all hover:shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                <div className="mb-6 relative">
                  <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <Search className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    1
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 relative">Trouvez votre tuteur parfait</h3>
                <p className="text-muted-foreground relative leading-relaxed">
                  Parcourez +50 tuteurs certifiés. Filtrez par matière, niveau et disponibilité pour trouver le match idéal.
                </p>
              </Card>
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
            </div>

            {/* Step 2 */}
            <div className="relative group animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-warm opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
              <Card className="p-8 text-center h-full border-2 hover:border-secondary/40 transition-all hover:shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16"></div>
                <div className="mb-6 relative">
                  <div className="w-20 h-20 bg-gradient-warm rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <Calendar className="w-10 h-10 text-secondary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    2
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 relative">Réservez en 2 clics</h3>
                <p className="text-muted-foreground relative leading-relaxed">
                  Essai gratuit inclus ! Choisissez votre créneau flexible et commencez quand vous voulez, où vous voulez.
                </p>
              </Card>
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-secondary to-transparent"></div>
            </div>

            {/* Step 3 */}
            <div className="relative group animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-success opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
              <Card className="p-8 text-center h-full border-2 hover:border-success/40 transition-all hover:shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16"></div>
                <div className="mb-6 relative">
                  <div className="w-20 h-20 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <TrendingUp className="w-10 h-10 text-success-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-success text-success-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    3
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 relative">Suivez vos progrès</h3>
                <p className="text-muted-foreground relative leading-relaxed">
                  Tableaux de bord personnalisés, rapports détaillés et évolution en temps réel de vos résultats.
                </p>
              </Card>
            </div>
          </div>

          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-gradient-primary hover:scale-105 transition-transform shadow-xl">
                Réserver un cours d'essai gratuit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Success Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block bg-success/10 text-success px-4 py-2 rounded-full text-sm font-semibold mb-4">
              ✨ Nos avantages
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Ce qui fait notre succès
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une approche complète et personnalisée pour chaque élève
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Tuteurs certifiés",
                description: "100% vérifiés avec +5 ans d'expérience moyenne en pédagogie",
              },
              {
                icon: Video,
                title: "Salle interactive",
                description: "Tableau blanc, partage d'écran et outils pédagogiques avancés",
              },
              {
                icon: Clock,
                title: "Horaires flexibles",
                description: "7j/7 de 8h à 22h, annulation gratuite jusqu'à 24h avant",
              },
              {
                icon: BarChart3,
                title: "Suivi détaillé",
                description: "Rapports hebdomadaires et tableaux de bord en temps réel",
              },
            ].map((feature, index) => (
              <Card 
                key={index}
                className="group p-8 hover:shadow-xl transition-all animate-fade-in border-2 hover:border-primary/40 relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 relative">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed relative">{feature.description}</p>
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
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              ⭐ Témoignages
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              +1 000 familles nous font confiance
            </h3>
            <p className="text-xl text-muted-foreground">
              Découvrez leurs histoires de réussite
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Amina K.",
                location: "Paris, France",
                text: "Ma fille a gagné 3 points de moyenne en mathématiques en seulement 2 mois ! Le tuteur est exceptionnel et vraiment pédagogue. Elle aime enfin les maths !",
                rating: 5,
                improvement: "+3 pts en maths",
                avatar: "A"
              },
              {
                name: "Mohamed B.",
                location: "Montréal, Canada",
                text: "Parfait pour maintenir le français avec nos enfants expatriés. Les horaires flexibles s'adaptent au décalage horaire. Un vrai plus pour nous !",
                rating: 5,
                improvement: "Bilinguisme réussi",
                avatar: "M"
              },
              {
                name: "Sarah L.",
                location: "Casablanca, Maroc",
                text: "Une plateforme qui respecte nos valeurs. Mon fils est passé de 12 à 16 de moyenne générale en un trimestre. Merci Oumi'School !",
                rating: 5,
                improvement: "+4 pts moyenne",
                avatar: "S"
              }
            ].map((testimonial, index) => (
              <Card 
                key={index}
                className="p-8 animate-fade-in hover:shadow-xl transition-all border-2 hover:border-success/30 relative group overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                <div className="flex mb-4 relative">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic leading-relaxed relative">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3 relative">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">
                    {testimonial.improvement}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Badges de Confiance - Inspiré GoStudent */}
      <section className="py-16 bg-background border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2 animate-fade-in">
              <div className="h-16 w-16 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-3">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h4 className="font-bold">Paiement sécurisé</h4>
              <p className="text-sm text-muted-foreground">Transaction 100% sécurisée</p>
            </div>
            <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="h-16 w-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-bold">Support 24/7</h4>
              <p className="text-sm text-muted-foreground">Assistance disponible</p>
            </div>
            <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="h-16 w-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center mb-3">
                <Award className="h-8 w-8 text-secondary" />
              </div>
              <h4 className="font-bold">Tuteurs certifiés</h4>
              <p className="text-sm text-muted-foreground">Sélection rigoureuse</p>
            </div>
            <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="h-16 w-16 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-3">
                <BarChart3 className="h-8 w-8 text-success" />
              </div>
              <h4 className="font-bold">Suivi des progrès</h4>
              <p className="text-sm text-muted-foreground">Rapports détaillés</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                ❓ FAQ
              </div>
              <h3 className="text-4xl md:text-5xl font-bold mb-4">
                Questions fréquentes
              </h3>
              <p className="text-xl text-muted-foreground">
                Tout ce que vous devez savoir sur Oumi'School
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

      {/* Footer - Enrichi style GoStudent */}
      <footer className="bg-gradient-to-b from-card to-card/50 border-t py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="font-bold text-2xl bg-gradient-hero bg-clip-text text-transparent">Oumi'School</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Plateforme de tutorat en ligne pour les familles francophones du monde entier. 
                Excellence académique et valeurs éthiques.
              </p>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-foreground">Pour les familles</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#segments" className="text-muted-foreground hover:text-primary transition-colors">Familles IEF</a></li>
                <li><a href="#segments" className="text-muted-foreground hover:text-primary transition-colors">Expatriés</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Tarifs & formules</a></li>
                <li><Link to="/lessons" className="text-muted-foreground hover:text-primary transition-colors">Matières disponibles</Link></li>
                <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">Questions fréquentes</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-foreground">Pour les tuteurs</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/tutor-signup" className="text-muted-foreground hover:text-primary transition-colors">Devenir tuteur</Link></li>
                <li><Link to="/tutors" className="text-muted-foreground hover:text-primary transition-colors">Nos tuteurs</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Avantages tuteurs</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Code de conduite</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-foreground">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contactez-nous</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Conditions générales</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; 2025 Oumi'School. Tous droits réservés.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">Conditions d'utilisation</a>
                <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
                <a href="#" className="hover:text-primary transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
