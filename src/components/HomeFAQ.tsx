import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const faqItems = [
  {
    question: "Comment fonctionne l'inscription sur Oumi'School ?",
    answer: "L'inscription est simple et rapide ! Créez votre compte parent en 2 minutes, ajoutez vos enfants et leur niveau scolaire, puis explorez nos ressources gratuites ou réservez une session avec un tuteur. Aucun engagement, vous pouvez commencer gratuitement."
  },
  {
    question: "Les tuteurs sont-ils qualifiés ?",
    answer: "Absolument ! Tous nos tuteurs sont diplômés (minimum Bac+3) et passent par un processus de sélection rigoureux incluant une vérification des diplômes, un entretien pédagogique et une période d'essai supervisée. Beaucoup ont également une expérience de l'enseignement en IEF ou en établissement."
  },
  {
    question: "Le programme est-il aligné avec l'Éducation Nationale ?",
    answer: "Oui, nos contenus suivent le socle commun de connaissances et de compétences défini par l'Éducation Nationale française. C'est idéal pour les familles IEF qui doivent se conformer aux contrôles académiques, ou pour les expatriés souhaitant maintenir le niveau français de leurs enfants."
  },
  {
    question: "Puis-je annuler ou reporter une session ?",
    answer: "Bien sûr ! Vous pouvez annuler ou reporter une session jusqu'à 24 heures avant l'heure prévue, sans frais. Pour les annulations de dernière minute, nous évaluons chaque situation au cas par cas. Notre priorité est votre satisfaction."
  },
  {
    question: "Quels sont les modes de paiement acceptés ?",
    answer: "Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal et les virements bancaires. Les paiements sont sécurisés et vous recevez une facture pour chaque transaction. Les abonnements sont sans engagement et peuvent être annulés à tout moment."
  },
  {
    question: "Comment se déroule une session de tutorat ?",
    answer: "Les sessions se déroulent en visioconférence via notre plateforme intégrée. Le tuteur dispose d'un tableau blanc interactif, peut partager des documents et utiliser des outils ludiques adaptés à l'âge de l'enfant. Les parents peuvent suivre les progrès via des rapports détaillés après chaque session."
  },
  {
    question: "Proposez-vous des cours pour les enfants à besoins particuliers ?",
    answer: "Oui, plusieurs de nos tuteurs sont formés pour accompagner les enfants avec des besoins spécifiques (dyslexie, TDAH, HPI, etc.). Lors de l'inscription, vous pouvez préciser les besoins de votre enfant et nous vous orienterons vers les tuteurs les plus adaptés."
  },
  {
    question: "Y a-t-il un engagement minimum ?",
    answer: "Non, aucun engagement ! Vous pouvez utiliser la formule gratuite aussi longtemps que vous le souhaitez, et les abonnements Premium sont mensuels et résiliables à tout moment. Nous croyons en la qualité de notre service, pas en les contrats contraignants."
  }
];

export const HomeFAQ = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-full mb-4">
            <HelpCircle className="h-4 w-4 mr-2" />
            Questions fréquentes
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Tout ce que vous devez savoir
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Trouvez rapidement les réponses à vos questions
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border-2 border-border/50 rounded-2xl px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-md transition-all"
                >
                  <AccordionTrigger className="text-left font-semibold font-display hover:no-underline py-5 text-base md:text-lg">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
