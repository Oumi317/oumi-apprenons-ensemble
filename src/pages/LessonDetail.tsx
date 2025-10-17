import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Clock, BookOpen, ArrowLeft, Play, CheckCircle, Star, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const difficulteColors = {
  facile: "bg-success/10 text-success",
  moyen: "bg-secondary/10 text-secondary",
  difficile: "bg-destructive/10 text-destructive",
};

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    loadLesson();
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await loadChildren(user.id);
    }
  };

  const loadChildren = async (userId: string) => {
    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("parent_id", userId);
    
    if (data && data.length > 0) {
      setChildren(data);
      setSelectedChild(data[0].id);
      await loadProgress(data[0].id);
    }
  };

  const loadLesson = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Leçon introuvable",
        variant: "destructive",
      });
      navigate("/lessons");
    } else {
      setLesson(data);
    }
    setLoading(false);
  };

  const loadProgress = async (studentId: string) => {
    if (!id) return;
    
    const { data } = await supabase
      .from("student_progress")
      .select("*")
      .eq("etudiant_id", studentId)
      .eq("lesson_id", id)
      .single();

    setProgress(data);
  };

  const handleStartLesson = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour commencer cette leçon",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!selectedChild) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un enfant",
        variant: "destructive",
      });
      return;
    }

    // Créer ou mettre à jour la progression
    const { error } = await supabase
      .from("student_progress")
      .upsert({
        etudiant_id: selectedChild,
        lesson_id: id,
        date_debut: new Date().toISOString(),
        statut_completion: 10,
        tentatives: (progress?.tentatives || 0) + 1,
      }, {
        onConflict: "etudiant_id,lesson_id"
      });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la leçon",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Leçon commencée !",
        description: "Bon apprentissage !",
      });
      await loadProgress(selectedChild);
    }
  };

  const handleCompleteLesson = async () => {
    if (!selectedChild) return;

    const { error } = await supabase
      .from("student_progress")
      .upsert({
        etudiant_id: selectedChild,
        lesson_id: id,
        statut_completion: 100,
        date_completion: new Date().toISOString(),
      }, {
        onConflict: "etudiant_id,lesson_id"
      });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer comme complétée",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Félicitations ! 🎉",
        description: "Leçon terminée avec succès !",
      });
      await loadProgress(selectedChild);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/lessons" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Oumi'School
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/lessons">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux leçons
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Lesson Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {lesson.niveau_scolaire}
              </Badge>
              <Badge variant="secondary">
                {lesson.matiere}
              </Badge>
              <Badge
                variant="secondary"
                className={difficulteColors[lesson.difficulte as keyof typeof difficulteColors]}
              >
                {lesson.difficulte}
              </Badge>
              {!lesson.gratuit && (
                <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                  Premium
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold">{lesson.titre}</h1>
            <p className="text-xl text-muted-foreground">{lesson.description}</p>
            
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{lesson.duree_estimee_minutes} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="capitalize">{lesson.type_contenu}</span>
              </div>
            </div>

            {progress && (
              <Card className="bg-gradient-success">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Progression</span>
                    <span className="text-white font-bold">{progress.statut_completion}%</span>
                  </div>
                  <Progress value={progress.statut_completion} className="h-3" />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video/Content Player */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Play className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Contenu de la leçon</h3>
                        <p className="text-sm text-muted-foreground">
                          Le lecteur vidéo sera disponible prochainement
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lesson Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Détails de la leçon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-success" />
                      Alignement programme officiel
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {lesson.alignement_socle_commun}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Objectifs pédagogiques</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Comprendre les concepts fondamentaux</li>
                      <li>Appliquer les connaissances à travers des exercices</li>
                      <li>Évaluer sa compréhension avec un quiz</li>
                    </ul>
                  </div>

                  {lesson.type_contenu === "quiz" && (
                    <div>
                      <h4 className="font-semibold mb-2">Format du quiz</h4>
                      <p className="text-sm text-muted-foreground">
                        10 questions à choix multiples • Correction immédiate • Score détaillé
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user && children.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pour quel enfant ?</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={selectedChild || ""}
                        onChange={(e) => {
                          setSelectedChild(e.target.value);
                          loadProgress(e.target.value);
                        }}
                      >
                        {children.map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.prenom} ({child.niveau_scolaire})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {progress?.statut_completion === 100 ? (
                    <div className="p-4 bg-success/10 rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                      <p className="text-sm font-semibold text-success">Leçon complétée !</p>
                    </div>
                  ) : (
                    <>
                      {progress ? (
                        <Button
                          className="w-full bg-gradient-primary"
                          onClick={handleStartLesson}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Reprendre
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-gradient-primary"
                          onClick={handleStartLesson}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Commencer la leçon
                        </Button>
                      )}
                      
                      {progress && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleCompleteLesson}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marquer comme complétée
                        </Button>
                      )}
                    </>
                  )}

                  {!user && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Connectez-vous pour commencer
                      </p>
                      <Link to="/auth">
                        <Button className="w-full bg-gradient-primary">
                          Se connecter
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Related Lessons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Leçons similaires</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <h4 className="font-semibold text-sm mb-1">Leçon suivante</h4>
                    <p className="text-xs text-muted-foreground">
                      Prochaine étape dans votre parcours
                    </p>
                  </div>
                  <Link to="/lessons">
                    <Button variant="outline" className="w-full" size="sm">
                      Voir toutes les leçons
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Need Help */}
              <Card className="bg-gradient-warm text-white border-0">
                <CardContent className="pt-6 text-center">
                  <h3 className="font-bold mb-2">Besoin d'aide ?</h3>
                  <p className="text-sm mb-4 text-white/90">
                    Réservez une session avec un tuteur expert
                  </p>
                  <Link to="/tutors">
                    <Button variant="secondary" size="sm" className="w-full">
                      Trouver un tuteur
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonDetail;
