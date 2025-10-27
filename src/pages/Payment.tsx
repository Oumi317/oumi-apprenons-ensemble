import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BraintreePayment } from "@/components/BraintreePayment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, CheckCircle, Star, Shield, Clock, 
  Users, Trophy, Sparkles, Gift, Zap 
} from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<{
    amount: number;
    description: string;
  } | null>(null);

  const plans = [
    {
      id: 1,
      name: "Session d'essai",
      tagline: "Idéal pour commencer",
      amount: 0,
      originalPrice: 25,
      description: "Première session gratuite",
      features: [
        "1 session de 60 minutes",
        "Choix du tuteur",
        "Enregistrement de la session",
        "Support 7j/7",
      ],
      icon: Gift,
      badge: "GRATUIT",
      popular: false,
    },
    {
      id: 2,
      name: "Pack Découverte",
      tagline: "Le plus populaire",
      amount: 99,
      originalPrice: 125,
      description: "5 sessions de tutorat",
      features: [
        "5 sessions de 60 minutes",
        "Économisez 26€",
        "Tuteurs certifiés prioritaires",
        "Enregistrements inclus",
        "Rapport de progression",
        "Support prioritaire",
      ],
      icon: Star,
      badge: "POPULAIRE",
      popular: true,
      savings: "20%",
    },
    {
      id: 3,
      name: "Abonnement Premium",
      tagline: "Meilleure valeur",
      amount: 249,
      originalPrice: 350,
      description: "Accès illimité pendant 1 mois",
      features: [
        "Sessions illimitées",
        "Tous les tuteurs disponibles",
        "Enregistrements illimités",
        "Rapports détaillés hebdomadaires",
        "AI Tutor inclus",
        "Support VIP 24/7",
        "Annulation flexible",
        "Garantie satisfait ou remboursé",
      ],
      icon: Trophy,
      badge: "MEILLEURE OFFRE",
      popular: false,
      savings: "30%",
    },
  ];

  const handleSuccess = () => {
    navigate("/parent-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            ⚡ Offre limitée - Première session gratuite
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choisissez votre formule
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Des plans flexibles adaptés à vos besoins. Changez ou annulez à tout moment.
          </p>
        </div>

        {!selectedPlan ? (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-12">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden group ${
                      plan.popular ? 'border-primary border-2 shadow-lg' : ''
                    }`}
                    onClick={() =>
                      setSelectedPlan({
                        amount: plan.amount,
                        description: plan.description,
                      })
                    }
                  >
                    {plan.popular && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-primary"></div>
                    )}
                    {plan.badge && (
                      <div className="absolute top-4 right-4">
                        <Badge className={`${
                          plan.popular 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-success/10 text-success border-success/20'
                        }`}>
                          {plan.badge}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-8">
                      <div className="mb-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-primary">
                            {plan.amount}€
                          </span>
                          {plan.originalPrice > plan.amount && (
                            <span className="text-lg text-muted-foreground line-through">
                              {plan.originalPrice}€
                            </span>
                          )}
                        </div>
                        {plan.savings && (
                          <Badge variant="secondary" className="bg-success/10 text-success">
                            <Zap className="h-3 w-3 mr-1" />
                            Économisez {plan.savings}
                          </Badge>
                        )}
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className={`w-full mt-6 ${
                          plan.popular ? 'bg-gradient-primary' : ''
                        }`}
                        size="lg"
                      >
                        {plan.amount === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Garanties */}
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto py-12 border-t">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold">Paiement sécurisé</h4>
                <p className="text-sm text-muted-foreground">SSL & cryptage</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Clock className="h-6 w-6 text-success" />
                </div>
                <h4 className="font-semibold">Annulation 24h</h4>
                <p className="text-sm text-muted-foreground">Gratuite et sans frais</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h4 className="font-semibold">+50 tuteurs</h4>
                <p className="text-sm text-muted-foreground">Certifiés experts</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold">Satisfaction</h4>
                <p className="text-sm text-muted-foreground">92% de progrès</p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
                <CardDescription>{selectedPlan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-lg">
                  <span>Total à payer:</span>
                  <span className="font-bold text-2xl text-primary">
                    {selectedPlan.amount} €
                  </span>
                </div>
              </CardContent>
            </Card>

            <BraintreePayment
              amount={selectedPlan.amount}
              description={selectedPlan.description}
              onSuccess={handleSuccess}
            />

            <Button
              variant="outline"
              onClick={() => setSelectedPlan(null)}
              className="w-full"
            >
              Changer de formule
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
