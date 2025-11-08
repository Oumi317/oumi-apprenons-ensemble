import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const MATIERES = ["Mathématiques", "Français", "Anglais", "Sciences", "Histoire"];
const NIVEAUX = ["cm1", "cm2", "sixieme", "cinquieme", "quatrieme", "troisieme", "seconde", "premiere", "terminale"];

interface Template {
  id: string;
  titre: string;
  matiere: string;
  niveau_scolaire: string;
  duree_minutes: number;
  objectifs: string[];
}

export default function LessonPlanTemplates() {
  const [tutorId, setTutorId] = useState<string>("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [titre, setTitre] = useState("");
  const [matiere, setMatiere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [duree, setDuree] = useState("60");
  const [objectifs, setObjectifs] = useState("");

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tutor } = await supabase
        .from("tutors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!tutor) return;
      setTutorId(tutor.id);

      const { data: templateData } = await supabase
        .from("lesson_plan_templates")
        .select("*")
        .eq("tutor_id", tutor.id)
        .order("created_at", { ascending: false });

      setTemplates(templateData || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!titre || !matiere || !niveau || !objectifs) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const objectifsArray = objectifs.split("\n").filter(o => o.trim());

      const { error } = await supabase
        .from("lesson_plan_templates")
        .insert([{
          tutor_id: tutorId,
          titre,
          matiere,
          niveau_scolaire: niveau as any,
          duree_minutes: parseInt(duree),
          objectifs: objectifsArray
        }]);

      if (error) throw error;

      toast({
        title: "Template créé",
        description: "Votre plan de cours a été enregistré"
      });

      setIsDialogOpen(false);
      setTitre("");
      setMatiere("");
      setNiveau("");
      setDuree("60");
      setObjectifs("");
      fetchData();
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le template",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("lesson_plan_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Template supprimé"
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Plans de Cours
            </CardTitle>
            <CardDescription>
              Créez des templates réutilisables
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un plan de cours</DialogTitle>
                <DialogDescription>
                  Définissez un template réutilisable pour vos sessions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input
                    placeholder="Introduction aux fractions"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Matière *</Label>
                    <Select value={matiere} onValueChange={setMatiere}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATIERES.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Niveau *</Label>
                    <Select value={niveau} onValueChange={setNiveau}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {NIVEAUX.map(n => (
                          <SelectItem key={n} value={n}>{n.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Durée (min)</Label>
                    <Input
                      type="number"
                      value={duree}
                      onChange={(e) => setDuree(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Objectifs * (un par ligne)</Label>
                  <Textarea
                    placeholder="Comprendre le concept de fraction&#10;Savoir simplifier une fraction&#10;Résoudre des exercices simples"
                    value={objectifs}
                    onChange={(e) => setObjectifs(e.target.value)}
                    rows={5}
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Créer le template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Aucun template pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{template.titre}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.matiere} • {template.niveau_scolaire.toUpperCase()} • {template.duree_minutes} min
                    </p>
                    {template.objectifs.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Objectifs :</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {template.objectifs.map((obj, idx) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}