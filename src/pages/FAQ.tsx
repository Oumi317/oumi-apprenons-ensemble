import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GraduationCap, HelpCircle, Shield, CreditCard, Users, BookOpen } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";

const FAQ = () => {
  return (
    <Layout>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero */}
          <ScrollReveal className="text-center space-y-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">Questions fréquentes</h1>
            <p className="text-xl text-muted-foreground">
              Toutes les réponses à vos questions sur Oumi'School
            </p>
          </ScrollReveal>

          {/* Categories */}
          <StaggerContainer className="grid md:grid-cols-3 gap-4">
            <StaggerItem>
              <Card className="border-primary/20 hover:border-primary/40 transition-colors hover-scale">
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Pour les parents</h3>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="border-secondary/20 hover:border-secondary/40 transition-colors hover-scale">
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <h3 className="font-semibold">Ressources pédagogiques</h3>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="border-success/20 hover:border-success/40 transition-colors hover-scale">
                <CardContent className="pt-6 text-center">
                  <GraduationCap className="h-8 w-8 text-success mx-auto mb-2" />
                  <h3 className="font-semibold">Pour les tuteurs</h3>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>

          {/* FAQ Sections */}
          <ScrollReveal delay={0.1}>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Général
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Qu'est-ce qu'Oumi'School ?</AccordionTrigger>
                    <AccordionContent>
                      Oumi'School est une plateforme éducative francophone qui combine tutorat en direct 
                      via visioconférence et ressources pédagogiques interactives. Nous accompagnons les 
                      élèves du CP au lycée avec des contenus alignés sur le programme français officiel.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>Pour qui est destiné Oumi'School ?</AccordionTrigger>
                    <AccordionContent>
                      Notre plateforme s'adresse principalement à trois segments :
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Les familles pratiquant l'Instruction En Famille (IEF) en France</li>
                        <li>Les parents expatriés francophones dans le monde entier</li>
                        <li>Les communautés musulmanes recherchant une éducation de qualité</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>Comment fonctionne la plateforme ?</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li>Créez un compte gratuit en quelques minutes</li>
                        <li>Ajoutez vos enfants avec leur niveau scolaire</li>
                        <li>Explorez notre bibliothèque de ressources pédagogiques</li>
                        <li>Réservez des sessions de tutorat avec nos professeurs certifiés</li>
                        <li>Suivez les progrès de vos enfants depuis votre tableau de bord</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-primary" />
                  Abonnements & Tarifs
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Quelles sont les formules disponibles ?</AccordionTrigger>
                    <AccordionContent>
                      Nous proposons trois formules :
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li><strong>Gratuit</strong> : 5 leçons par semaine, accès communauté, 1 session gratuite</li>
                        <li><strong>Premium Individuel (9,99€/mois)</strong> : Accès illimité aux leçons, 1 enfant, suivi personnalisé</li>
                        <li><strong>Premium Famille (24,99€/mois)</strong> : Tous les avantages Premium, jusqu'à 4 enfants, remise tutorat -10%</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>Comment fonctionnent les sessions de tutorat ?</AccordionTrigger>
                    <AccordionContent>
                      Les sessions de tutorat sont facturées séparément selon le tarif du tuteur 
                      (généralement entre 30-50€/heure). Vous réservez directement avec le tuteur 
                      de votre choix et payez uniquement les sessions que vous utilisez. Les abonnés 
                      Premium Famille bénéficient d'une remise de 10%.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>Puis-je annuler mon abonnement ?</AccordionTrigger>
                    <AccordionContent>
                      Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. 
                      Aucun engagement, aucuns frais cachés. Votre abonnement reste actif jusqu'à la fin 
                      de la période payée.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger>Quels moyens de paiement acceptez-vous ?</AccordionTrigger>
                    <AccordionContent>
                      Nous acceptons :
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Cartes bancaires (Visa, Mastercard, American Express)</li>
                        <li>Pour l'Afrique francophone : Mobile Money (Orange Money, MTN, Moov Money)</li>
                        <li>PayPal (bientôt disponible)</li>
                      </ul>
                      Tous les paiements sont sécurisés et traités via Stripe.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-secondary" />
                  Contenu pédagogique
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-8">
                    <AccordionTrigger>
                      Le contenu est-il aligné avec le programme français ?
                    </AccordionTrigger>
                    <AccordionContent>
                      Oui, absolument ! Toutes nos ressources sont conçues en respectant le socle commun 
                      de connaissances de l'Éducation Nationale française. Chaque leçon indique clairement 
                      son alignement avec le programme officiel, ce qui est particulièrement important pour 
                      les familles IEF lors des contrôles du rectorat.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-9">
                    <AccordionTrigger>Quels types de ressources proposez-vous ?</AccordionTrigger>
                    <AccordionContent>
                      Notre bibliothèque comprend :
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li><strong>Leçons vidéo</strong> : Explications claires et structurées</li>
                        <li><strong>Exercices interactifs</strong> : Avec correction automatique</li>
                        <li><strong>Quiz évaluatifs</strong> : Pour tester les connaissances</li>
                        <li><strong>Documents PDF</strong> : Fiches de révision téléchargeables</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-10">
                    <AccordionTrigger>
                      Peut-on télécharger les ressources pour travailler hors ligne ?
                    </AccordionTrigger>
                    <AccordionContent>
                      Les documents PDF et fiches de révision peuvent être téléchargés. Les leçons vidéo 
                      sont accessibles en streaming uniquement pour des raisons de droits d'auteur. Nous 
                      travaillons sur une fonctionnalité de téléchargement temporaire pour les abonnés Premium.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-success" />
                  Tuteurs & Sessions
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-11">
                    <AccordionTrigger>Comment sont sélectionnés les tuteurs ?</AccordionTrigger>
                    <AccordionContent>
                      Tous nos tuteurs passent par un processus de sélection rigoureux :
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Vérification des diplômes et certifications</li>
                        <li>Vérification du casier judiciaire (bulletin n°3)</li>
                        <li>Entretien d'évaluation pédagogique</li>
                        <li>Session de démonstration évaluée</li>
                      </ul>
                      Seuls 20% des candidats sont acceptés.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-12">
                    <AccordionTrigger>Comment se déroule une session de tutorat ?</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li>Réservez un créneau avec le tuteur de votre choix</li>
                        <li>Recevez un lien Zoom 24h avant la session</li>
                        <li>Connectez-vous à l'heure prévue</li>
                        <li>Session en visio (généralement 1h)</li>
                        <li>Après la session, le tuteur envoie un rapport détaillé</li>
                        <li>Vous pouvez noter le tuteur et laisser un avis</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-13">
                    <AccordionTrigger>
                      Puis-je annuler ou reprogrammer une session ?
                    </AccordionTrigger>
                    <AccordionContent>
                      Vous pouvez annuler ou reprogrammer gratuitement jusqu'à 24h avant la session. 
                      En cas d'annulation tardive (moins de 24h), des frais de 50% peuvent s'appliquer. 
                      En cas d'urgence justifiée, contactez notre support pour trouver une solution.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-14">
                    <AccordionTrigger>
                      Les sessions sont-elles enregistrées ?
                    </AccordionTrigger>
                    <AccordionContent>
                      Avec votre consentement, les sessions peuvent être enregistrées et mises à disposition 
                      dans votre espace personnel pendant 30 jours. Cela permet à votre enfant de revoir 
                      les explications. Les enregistrements sont ensuite automatiquement supprimés pour 
                      des raisons de confidentialité.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.5}>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Sécurité & Confidentialité
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-15">
                    <AccordionTrigger>Mes données sont-elles sécurisées ?</AccordionTrigger>
                    <AccordionContent>
                      Oui, absolument. Nous sommes 100% conformes au RGPD :
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Toutes les données sont hébergées en Europe</li>
                        <li>Chiffrement de bout en bout pour les données sensibles</li>
                        <li>Vous pouvez exporter ou supprimer vos données à tout moment</li>
                        <li>Consentement parental obligatoire pour les mineurs</li>
                        <li>Aucune vente de données à des tiers</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-16">
                    <AccordionTrigger>
                      Comment protégez-vous les mineurs pendant les sessions ?
                    </AccordionTrigger>
                    <AccordionContent>
                      La sécurité des enfants est notre priorité absolue :
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Tous les tuteurs ont un casier judiciaire vierge vérifié</li>
                        <li>Les parents peuvent assister aux sessions</li>
                        <li>Système de signalement instantané en cas de problème</li>
                        <li>Enregistrements disponibles pour vérification</li>
                        <li>Code de conduite strict pour tous les tuteurs</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={0.6}>
            <Card className="bg-gradient-hero text-white border-0 overflow-hidden">
              <CardContent className="py-12 text-center relative">
                <h3 className="text-3xl font-display font-bold mb-4">
                  Une autre question ?
                </h3>
                <p className="text-xl mb-6 text-white/90">
                  Notre équipe est là pour vous aider
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth?mode=signup">
                    <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform">
                      Essayer gratuitement
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                    Contacter le support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </main>
    </Layout>
  );
};

export default FAQ;
