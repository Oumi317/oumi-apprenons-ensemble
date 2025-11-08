import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";

export default function BudgetManagement() {
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("80");
  const [currentSpending, setCurrentSpending] = useState(0);
  const [budgetAlert, setBudgetAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer l'alerte budget existante
      const { data: alert } = await supabase
        .from("budget_alerts")
        .select("*")
        .eq("parent_id", user.id)
        .eq("is_active", true)
        .single();

      if (alert) {
        setBudgetAlert(alert);
        setMonthlyLimit(alert.monthly_limit.toString());
        setAlertThreshold((alert.alert_threshold * 100).toString());
      }

      // Calculer les dépenses du mois en cours
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());

      const { data: students } = await supabase
        .from("students")
        .select("id")
        .eq("parent_id", user.id);

      if (students && students.length > 0) {
        const { data: sessions } = await supabase
          .from("sessions_tutorat")
          .select("montant_paye")
          .in("etudiant_id", students.map(s => s.id))
          .gte("date_heure_debut", start.toISOString())
          .lte("date_heure_debut", end.toISOString())
          .not("montant_paye", "is", null);

        const total = sessions?.reduce((sum, s) => sum + Number(s.montant_paye || 0), 0) || 0;
        setCurrentSpending(total);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const budgetData = {
        parent_id: user.id,
        monthly_limit: parseFloat(monthlyLimit),
        alert_threshold: parseFloat(alertThreshold) / 100,
        is_active: true
      };

      if (budgetAlert) {
        await supabase
          .from("budget_alerts")
          .update(budgetData)
          .eq("id", budgetAlert.id);
      } else {
        await supabase
          .from("budget_alerts")
          .insert(budgetData);
      }

      toast({
        title: "Budget configuré",
        description: "Votre budget mensuel a été enregistré avec succès"
      });

      fetchBudgetData();
    } catch (error) {
      console.error("Error saving budget:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le budget",
        variant: "destructive"
      });
    }
  };

  const percentage = monthlyLimit ? (currentSpending / parseFloat(monthlyLimit)) * 100 : 0;
  const isOverThreshold = percentage >= parseFloat(alertThreshold);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Gestion du Budget
          </CardTitle>
          <CardDescription>
            Définissez votre budget mensuel et recevez des alertes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monthly-limit">Budget mensuel (€)</Label>
              <Input
                id="monthly-limit"
                type="number"
                placeholder="500"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-threshold">Seuil d'alerte (%)</Label>
              <Input
                id="alert-threshold"
                type="number"
                placeholder="80"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSaveBudget}>Enregistrer le budget</Button>
        </CardContent>
      </Card>

      {monthlyLimit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dépenses du mois - {format(new Date(), "MMMM yyyy", { locale: fr })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Dépensé : {currentSpending.toFixed(2)} €</span>
              <span>Budget : {monthlyLimit} €</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="text-sm text-muted-foreground">
              {percentage.toFixed(0)}% du budget utilisé
            </div>

            {isOverThreshold && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Attention : Vous avez dépassé votre seuil d'alerte de {alertThreshold}%
                </span>
              </div>
            )}

            <div className="grid gap-4 pt-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Reste disponible</p>
                  <p className="text-2xl font-bold">
                    {(parseFloat(monthlyLimit) - currentSpending).toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}