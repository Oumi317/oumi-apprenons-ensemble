import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Users, Target, BookOpen, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingFlowProps {
  userId: string;
  userRole: string;
}

export const OnboardingFlow = ({ userId, userRole }: OnboardingFlowProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Parent data
  const [children, setChildren] = useState([{
    prenom: "",
    date_naissance: "",
    niveau_scolaire: "",
    objectifs: [] as string[],
  }]);

  const totalSteps = userRole === "parent" ? 2 : 2;
  const progress = (step / totalSteps) * 100;

  const objectives = [
    "Améliorer les notes",
    "Préparer un examen",
    "Combler des lacunes",
    "Enrichissement",
    "Devoirs et révisions",
    "Apprentissage langue",
  ];

  const niveauxScolaires = [
    "CP", "CE1", "CE2", "CM1", "CM2",
    "6eme", "5eme", "4eme", "3eme",
    "Seconde", "Premiere", "Terminale"
  ];

  const handleAddChild = () => {
    setChildren([...children, {
      prenom: "",
      date_naissance: "",
      niveau_scolaire: "",
      objectifs: [],
    }]);
  };

  const handleRemoveChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: string, value: any) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const toggleObjective = (childIndex: number, objective: string) => {
    const updated = [...children];
    const objectives = updated[childIndex].objectifs;
    if (objectives.includes(objective)) {
      updated[childIndex].objectifs = objectives.filter(o => o !== objective);
    } else {
      updated[childIndex].objectifs = [...objectives, objective];
    }
    setChildren(updated);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (userRole === "parent") {
        // Create children profiles
        for (const child of children) {
          if (child.prenom && child.niveau_scolaire) {
            const { error } = await supabase
              .from("students")
              .insert([{
                parent_id: userId,
                prenom: child.prenom,
                date_naissance: child.date_naissance || new Date().toISOString().split('T')[0],
                niveau_scolaire: child.niveau_scolaire as any,
                objectifs_apprentissage: child.objectifs.join(", "),
              }]);

            if (error) throw error;
          }
        }

        toast({
          title: "Profils créés !",
          description: "Vos enfants ont été ajoutés avec succès",
        });
        navigate("/parent-dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2 && userRole === "parent") {
      return children.some(c => c.prenom && c.niveau_scolaire);
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Étape {step} sur {totalSteps}
            </p>
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && "Bienvenue sur Oumi'School ! 👋"}
            {step === 2 && userRole === "parent" && "Ajoutez vos enfants"}
            {step === 3 && "Choisissez vos objectifs"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Configurons votre compte en quelques étapes"}
            {step === 2 && userRole === "parent" && "Créez les profils de vos enfants"}
            {step === 3 && "Définissez les objectifs d'apprentissage"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-2">
                  <CardContent className="pt-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">Tuteurs certifiés</h4>
                    <p className="text-sm text-muted-foreground">
                      +50 tuteurs expérimentés
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="pt-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="h-6 w-6 text-secondary" />
                    </div>
                    <h4 className="font-semibold mb-2">Ressources illimitées</h4>
                    <p className="text-sm text-muted-foreground">
                      +15 matières disponibles
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="pt-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-success" />
                    </div>
                    <h4 className="font-semibold mb-2">Suivi personnalisé</h4>
                    <p className="text-sm text-muted-foreground">
                      Progression en temps réel
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Votre première session est gratuite !
                </h4>
                <p className="text-sm text-muted-foreground">
                  Profitez d'une session d'essai de 30 minutes avec le tuteur de votre choix.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Add Children (Parent only) */}
          {step === 2 && userRole === "parent" && (
            <div className="space-y-6 animate-fade-in">
              {children.map((child, index) => (
                <Card key={index} className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Enfant {index + 1}</CardTitle>
                      {children.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveChild(index)}
                        >
                          Retirer
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Prénom *</Label>
                        <Input
                          value={child.prenom}
                          onChange={(e) => updateChild(index, "prenom", e.target.value)}
                          placeholder="Prénom de l'enfant"
                        />
                      </div>
                      <div>
                        <Label>Date de naissance</Label>
                        <Input
                          type="date"
                          value={child.date_naissance}
                          onChange={(e) => updateChild(index, "date_naissance", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Niveau scolaire *</Label>
                      <Select
                        value={child.niveau_scolaire}
                        onValueChange={(value) => updateChild(index, "niveau_scolaire", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          {niveauxScolaires.map((niveau) => (
                            <SelectItem key={niveau} value={niveau}>
                              {niveau.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-3 block">Objectifs d'apprentissage</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {objectives.map((objective) => (
                          <div key={objective} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${index}-${objective}`}
                              checked={child.objectifs.includes(objective)}
                              onCheckedChange={() => toggleObjective(index, objective)}
                            />
                            <label
                              htmlFor={`${index}-${objective}`}
                              className="text-sm cursor-pointer"
                            >
                              {objective}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={handleAddChild}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                Ajouter un autre enfant
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
            )}
            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1"
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={loading || !canProceed()}
                className="flex-1 bg-gradient-primary"
              >
                {loading ? "Finalisation..." : "Commencer"}
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
