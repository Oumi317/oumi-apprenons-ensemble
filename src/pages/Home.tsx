import { lazy, Suspense, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Users, Globe, GraduationCap, CheckCircle, Star, 
  ArrowRight, Sparkles, Heart, Clock, MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { MobileMenu } from "@/components/MobileMenu";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";
import { FloatingShapes } from "@/components/FloatingShapes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SubjectBadges } from "@/components/SubjectBadges";
import { AnimatedIllustration, type IllustrationType } from "@/components/AnimatedIllustrations";
import { HomeFAQ } from "@/components/HomeFAQ";
import { ParallaxSection, ParallaxFloatingElement } from "@/components/ParallaxSection";

// Lazy loaded components pour optimisation
const LazyTestimonials = lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })));

const Home = () => {
  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      {/* Header simplifié */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display text-foreground">
              Oumi<span className="text-primary">&apos;</span>School
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/lessons">
              <Button variant="ghost" className="rounded-full font-medium">Ressources</Button>
            </Link>
            <Link to="/tutors">
              <Button variant="ghost" className="rounded-full font-medium">Tuteurs</Button>
            </Link>
            <Link to="/faq">
              <Button variant="ghost" className="rounded-full font-medium">FAQ</Button>
            </Link>
            <div className="w-px h-6 bg-border mx-2" />
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" className="rounded-full font-medium">Connexion</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="rounded-full bg-gradient-hero shadow-soft hover:shadow-md transition-shadow font-semibold px-6">
                Commencer gratuitement
              </Button>
            </Link>
          </nav>
          
          {/* Mobile menu */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Hero Section - Chaleureux et simplifié */}
      <section className="relative py-16 md:py-24 lg:py-32">
        {/* Background décoratif */}
        <div className="absolute inset-0 bg-gradient-soft" />
        <FloatingShapes />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge social proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/15 px-4 py-2 text-sm font-medium rounded-full">
                <Heart className="h-4 w-4 mr-2 fill-success" />
                Plus de 1 000 familles nous font confiance
              </Badge>
            </motion.div>
            
            {/* Titre principal */}
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              L&apos;école à la maison,
              <br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                simple et bienveillante
              </span>
            </motion.h1>
            
            {/* Sous-titre */}
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Des tuteurs bienveillants accompagnent vos enfants du CP au lycée, 
              avec des cours adaptés à votre rythme et vos valeurs.
            </motion.p>
            
            {/* CTA principal */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link to="/auth?mode=signup">
                <Button 
                  size="lg" 
                  className="rounded-full bg-gradient-hero shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg h-14 px-8 font-semibold group"
                >
                  Essayer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/tutors">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full border-2 h-14 px-8 font-semibold hover:bg-muted/50"
                >
                  Découvrir nos tuteurs
                </Button>
              </Link>
            </motion.div>
            
            {/* Stats simplifiées */}
            <motion.div 
              className="flex flex-wrap justify-center gap-8 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {[
                { value: "92%", label: "de réussite" },
                { value: "50+", label: "tuteurs certifiés" },
                { value: "4.8/5", label: "satisfaction" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold font-display text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Illustration cards avec animations Lottie */}
          <StaggerContainer 
            className="mt-16 md:mt-24 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
            staggerDelay={0.15}
          >
            {[
              { 
                illustration: "book" as IllustrationType,
                title: "Cours interactifs", 
                desc: "Leçons vivantes avec tableau blanc et outils ludiques",
                bgColor: "bg-primary/10"
              },
              { 
                illustration: "tutor" as IllustrationType,
                title: "Tuteurs bienveillants", 
                desc: "Professionnels passionnés qui s'adaptent à chaque enfant",
                bgColor: "bg-secondary/10"
              },
              { 
                illustration: "heart" as IllustrationType,
                title: "Valeurs respectées", 
                desc: "Environnement adapté à vos convictions familiales",
                bgColor: "bg-success/10"
              },
            ].map((item, index) => (
              <StaggerItem key={index}>
                <Card 
                  className="group border-2 border-transparent hover:border-primary/20 bg-card/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all hover:-translate-y-1 rounded-3xl overflow-hidden h-full"
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`mx-auto rounded-2xl ${item.bgColor} flex items-center justify-center p-4`}>
                      <AnimatedIllustration type={item.illustration} size="lg" />
                    </div>
                    <h3 className="text-lg font-bold font-display">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Section Matières */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-full mb-4">
              <BookOpen className="h-4 w-4 mr-2" />
              Toutes les matières
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Explorez nos matières
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Cliquez sur une matière pour trouver un tuteur spécialisé
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <SubjectBadges />
          </ScrollReveal>
        </div>
      </section>

      {/* Section "Comment ça marche" - 3 étapes simples */}
      <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        <ParallaxFloatingElement speed={0.3} className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Simple comme bonjour
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Commencez en 3 étapes
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Pas de complications, juste un accompagnement bienveillant
            </p>
          </ScrollReveal>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Ligne de connexion */}
              <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary via-secondary to-success" />
              
              {[
                { 
                  step: "1", 
                  title: "Inscrivez-vous", 
                  desc: "Créez votre compte famille en 2 minutes",
                  bgColor: "bg-primary",
                  textColor: "text-primary-foreground"
                },
                { 
                  step: "2", 
                  title: "Choisissez un tuteur", 
                  desc: "Parcourez les profils et réservez un cours d'essai",
                  bgColor: "bg-secondary",
                  textColor: "text-secondary-foreground"
                },
                { 
                  step: "3", 
                  title: "Apprenez sereinement", 
                  desc: "Suivez les progrès de vos enfants en temps réel",
                  bgColor: "bg-success",
                  textColor: "text-success-foreground"
                },
              ].map((item, index) => (
                <ScrollReveal key={index} delay={index * 0.15}>
                  <div className="relative text-center">
                    <motion.div 
                      className={`w-16 h-16 mx-auto mb-6 rounded-full ${item.bgColor} ${item.textColor} flex items-center justify-center text-xl font-bold font-display shadow-lg relative z-10`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {item.step}
                    </motion.div>
                    <h3 className="text-xl font-bold font-display mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            
            <ScrollReveal className="text-center mt-12" delay={0.4}>
              <Link to="/auth?mode=signup">
                <Button 
                  size="lg" 
                  className="rounded-full bg-gradient-hero shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold group"
                >
                  Créer mon compte gratuit
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Section "Pour qui" - Simplifiée avec parallaxe */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <ParallaxFloatingElement speed={0.2} className="absolute -top-20 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-secondary/5 to-transparent blur-3xl" />
        <ParallaxFloatingElement speed={0.4} className="absolute -bottom-20 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal className="text-center mb-16">
            <Badge className="bg-secondary/10 text-secondary border-secondary/20 px-4 py-2 rounded-full mb-4">
              <Heart className="h-4 w-4 mr-2 fill-secondary" />
              Pour toutes les familles
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Nous accompagnons votre famille
            </h2>
          </ScrollReveal>
          
          <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" staggerDelay={0.15}>
            {[
              {
                illustration: "book" as IllustrationType,
                title: "Familles IEF",
                desc: "Accompagnement aligné avec le socle commun pour une instruction réussie à domicile.",
                features: ["Suivi du programme officiel", "Préparation aux contrôles"],
                gradientFrom: "from-primary/10",
                gradientTo: "to-primary/5"
              },
              {
                illustration: "globe" as IllustrationType,
                title: "Expatriés",
                desc: "Maintenez le lien avec l'éducation française, où que vous soyez dans le monde.",
                features: ["Horaires flexibles tous fuseaux", "Préparation retour en France"],
                gradientFrom: "from-secondary/10",
                gradientTo: "to-secondary/5"
              },
              {
                illustration: "family" as IllustrationType,
                title: "Familles en quête de valeurs",
                desc: "Un environnement éducatif bienveillant respectant vos convictions.",
                features: ["Tuteurs sensibles à vos besoins", "Contenu adapté"],
                gradientFrom: "from-success/10",
                gradientTo: "to-success/5"
              },
            ].map((item, index) => (
              <StaggerItem key={index}>
                <Card 
                  className="group border-2 hover:border-primary/30 rounded-3xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full"
                >
                  <div className={`h-2 bg-gradient-to-r ${item.gradientFrom} ${item.gradientTo}`} />
                  <CardContent className="p-8 space-y-4">
                    <div className="rounded-2xl bg-gradient-to-br from-card to-muted flex items-center justify-center shadow-sm p-4">
                      <AnimatedIllustration type={item.illustration} size="lg" />
                    </div>
                    <h3 className="text-xl font-bold font-display">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                    <ul className="space-y-2 pt-2">
                      {item.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Section Tarifs - Simplifiée avec parallaxe */}
      <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        <ParallaxFloatingElement speed={0.25} rotate className="absolute top-20 right-[10%] w-32 h-32 rounded-3xl bg-gradient-to-br from-success/10 to-transparent blur-xl" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <AnimatedIllustration type="star" size="lg" />
            </div>
            <Badge className="bg-success/10 text-success border-success/20 px-4 py-2 rounded-full mb-4">
              Tarifs transparents
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Choisissez votre formule
            </h2>
            <p className="text-lg text-muted-foreground">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </ScrollReveal>
          
          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto items-start" staggerDelay={0.15}>
            {/* Gratuit */}
            <StaggerItem>
              <Card className="rounded-3xl border-2 hover:border-muted-foreground/30 transition-all h-full">
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold font-display mb-2">Gratuit</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold font-display">0€</span>
                      <span className="text-muted-foreground">/mois</span>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {["5 leçons par semaine", "1 session d'essai", "Accès communauté"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth?mode=signup" className="block">
                    <Button variant="outline" className="w-full rounded-full font-semibold">
                      Commencer
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </StaggerItem>
            
            {/* Premium - Populaire */}
            <StaggerItem>
              <Card className="rounded-3xl border-2 border-primary relative overflow-hidden shadow-lg md:scale-105 h-full">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-hero" />
                <Badge className="absolute top-4 right-4 bg-gradient-hero text-primary-foreground border-0 rounded-full">
                  Populaire
                </Badge>
                <CardContent className="p-8 space-y-6 pt-10">
                  <div>
                    <h3 className="text-xl font-bold font-display mb-2">Premium</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold font-display text-primary">9,99€</span>
                      <span className="text-muted-foreground">/mois</span>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {["Accès illimité", "1 enfant", "Suivi personnalisé", "Rapports mensuels"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth?mode=signup" className="block">
                    <Button className="w-full rounded-full bg-gradient-hero font-semibold shadow-md">
                      Choisir Premium
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </StaggerItem>
            
            {/* Famille */}
            <StaggerItem>
              <Card className="rounded-3xl border-2 hover:border-muted-foreground/30 transition-all h-full">
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold font-display mb-2">Famille</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold font-display">24,99€</span>
                      <span className="text-muted-foreground">/mois</span>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {["Jusqu'à 4 enfants", "Tout Premium inclus", "-10% sur le tutorat", "Support prioritaire"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth?mode=signup" className="block">
                    <Button variant="outline" className="w-full rounded-full font-semibold">
                      Choisir Famille
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Témoignages avec lazy loading */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <ScrollReveal className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-full mb-4">
              <MessageCircle className="h-4 w-4 mr-2" />
              Témoignages
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Ce que disent nos familles
            </h2>
          </ScrollReveal>
          
          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerDelay={0.15}>
            {[
              {
                quote: "Mes enfants adorent leurs cours ! Les tuteurs sont patients et vraiment à l'écoute.",
                author: "Sarah M.",
                role: "Maman IEF de 3 enfants",
                rating: 5
              },
              {
                quote: "Depuis Dubaï, mes filles suivent le programme français sans problème. Une vraie tranquillité d'esprit.",
                author: "Fatima A.",
                role: "Expatriée aux Émirats",
                rating: 5
              },
              {
                quote: "Le suivi personnalisé et les rapports détaillés nous aident vraiment à accompagner notre fils.",
                author: "Ahmed K.",
                role: "Papa de 2 enfants",
                rating: 5
              },
            ].map((testimonial, index) => (
              <StaggerItem key={index}>
                <Card className="rounded-3xl border-2 hover:shadow-lg transition-all h-full">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic leading-relaxed">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="pt-4 border-t">
                      <p className="font-semibold font-display">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ Section */}
      <HomeFAQ />

      {/* CTA Final */}
      <section className="py-20 md:py-28 bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <ScrollReveal direction="none">
            <div className="max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display">
                Prêt à commencer l&apos;aventure ?
              </h2>
              <p className="text-xl text-primary-foreground/90">
                Rejoignez plus de 1 000 familles qui ont choisi Oumi&apos;School pour l&apos;éducation de leurs enfants.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth?mode=signup">
                  <Button 
                    size="lg" 
                    className="rounded-full bg-white text-primary hover:bg-white/90 shadow-xl hover:scale-105 transition-all h-14 px-8 font-semibold text-lg group"
                  >
                    Créer mon compte gratuit
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-primary-foreground/70 flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                Inscription en moins de 2 minutes
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
