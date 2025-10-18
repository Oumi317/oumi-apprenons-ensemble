import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BraintreePayment } from "@/components/BraintreePayment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<{
    amount: number;
    description: string;
  } | null>(null);

  const plans = [
    {
      id: 1,
      name: "Session unique",
      amount: 25,
      description: "Une session de tutorat de 60 minutes",
    },
    {
      id: 2,
      name: "Pack 5 sessions",
      amount: 110,
      description: "5 sessions de tutorat (économisez 15€)",
    },
    {
      id: 3,
      name: "Abonnement mensuel",
      amount: 199,
      description: "Accès illimité pendant 1 mois",
    },
  ];

  const handleSuccess = () => {
    navigate("/parent-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Paiement</h1>
          <p className="text-muted-foreground">
            Choisissez votre formule et procédez au paiement sécurisé
          </p>
        </div>

        {!selectedPlan ? (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                onClick={() =>
                  setSelectedPlan({
                    amount: plan.amount,
                    description: plan.description,
                  })
                }
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {plan.amount} €
                  </div>
                  <Button className="w-full mt-4">Choisir</Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
