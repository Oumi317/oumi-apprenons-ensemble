import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Clock, BookOpen, ArrowLeft, Play, CheckCircle, Star, Award, Target, TrendingUp, Users, Lightbulb, FileText, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Quiz } from "@/components/Quiz";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LessonNotes } from "@/components/LessonNotes";
import { LessonResources } from "@/components/LessonResources";
import { Footer } from "@/components/Footer";

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
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [interactiveResources, setInteractiveResources] = useState<any[]>([]);

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
      .maybeSingle();

    if (error) {
      toast({
        title: "Erreur",
        description: "Leçon introuvable",
        variant: "destructive",
      });
      navigate("/lessons");
    } else {
      setLesson(data);
      if (data) {
        await loadInteractiveResources(data.id);
      }
    }
    setLoading(false);
  };

  const loadInteractiveResources = async (lessonId: string) => {
    const { data } = await supabase
      .from("interactive_resources")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("ordre_affichage", { ascending: true });

    if (data) {
      setInteractiveResources(data);
    }
  };

  const loadProgress = async (studentId: string) => {
    if (!id) return;
    
    const { data } = await supabase
      .from("student_progress")
      .select("*")
      .eq("etudiant_id", studentId)
      .eq("lesson_id", id)
      .maybeSingle();

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

  const handleMarkComplete = async () => {
    if (!selectedChild || !id) return;

    try {
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

      if (error) throw error;

      // Create study session
      await supabase.from("study_sessions").insert({
        student_id: selectedChild,
        lesson_id: id,
        session_type: "lesson",
        matiere: lesson.matiere,
        duration_minutes: lesson.duree_estimee_minutes || 30,
        completed: true,
      });

      toast({
        title: "Leçon terminée !",
        description: "Félicitations pour avoir complété cette leçon",
      });

      await loadProgress(selectedChild);
    } catch (error) {
      console.error("Error marking complete:", error);
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
          <div className="space-y-6">
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
            
            {/* Lesson Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{lesson.duree_estimee_minutes}</p>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold capitalize">{lesson.difficulte}</p>
                  <p className="text-sm text-muted-foreground">Niveau</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Video className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <p className="text-2xl font-bold capitalize">{lesson.type_contenu}</p>
                  <p className="text-sm text-muted-foreground">Format</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-muted-foreground">Réussite</p>
                </CardContent>
              </Card>
            </div>

            {progress && (
              <Card className="bg-gradient-success border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Votre progression
                    </span>
                    <span className="text-white font-bold text-lg">{progress.statut_completion}%</span>
                  </div>
                  <Progress value={progress.statut_completion} className="h-3 bg-white/20" />
                  {progress.tentatives > 0 && (
                    <p className="text-white/90 text-sm mt-2">
                      Tentative {progress.tentatives} • Temps passé: {progress.temps_passe_minutes || 0} min
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Ce que vous allez apprendre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Maîtriser les concepts fondamentaux de {lesson.matiere}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Appliquer les connaissances à travers des exercices pratiques</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Évaluer votre compréhension avec un quiz interactif</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Obtenir des ressources complémentaires pour approfondir</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="grid lg:grid-cols-3 gap-8">
          {/* Video/Content Player */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="lesson" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="lesson">Leçon</TabsTrigger>
                  <TabsTrigger value="quiz">Quiz</TabsTrigger>
                </TabsList>
                
                <TabsContent value="lesson" className="mt-6 space-y-6">
                  {lesson.contenu_url && lesson.type_contenu === "video" ? (
                    <VideoPlayer
                      videoUrl={lesson.contenu_url}
                      onTimeUpdate={(currentTime) => setCurrentVideoTime(currentTime)}
                      onComplete={() => handleMarkComplete()}
                      initialTime={progress?.temps_passe_minutes ? progress.temps_passe_minutes * 60 : 0}
                    />
                  ) : lesson.contenu_url ? (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <iframe
                            src={lesson.contenu_url}
                            className="w-full h-full"
                            title={lesson.titre}
                            allowFullScreen
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
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
                                Le contenu de cette leçon sera disponible prochainement
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lesson Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{lesson.description}</p>
                      {lesson.alignement_socle_commun && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-semibold mb-2 text-sm">Alignement socle commun</h4>
                          <p className="text-sm text-muted-foreground">{lesson.alignement_socle_commun}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Lesson Resources */}
                  <LessonResources
                    resources={[
                      ...interactiveResources.map((resource) => ({
                        id: resource.id,
                        titre: resource.titre,
                        type: resource.type as "interactive",
                        url: resource.file_url,
                        description: resource.description,
                      })),
                      {
                        id: "1",
                        titre: "Fiche de révision - " + lesson.titre,
                        type: "pdf" as const,
                        url: "#",
                        taille: "2.5 MB",
                        description: "Résumé des points clés de la leçon",
                      },
                      {
                        id: "2",
                        titre: "Exercices pratiques",
                        type: "document" as const,
                        url: "#",
                        taille: "1.8 MB",
                        description: "Exercices d'application pour s'entraîner",
                      },
                    ]}
                  />
                </TabsContent>

                <TabsContent value="quiz" className="mt-6">
                  {selectedChild ? (
                    <Quiz
                      lessonId={id!}
                      studentId={selectedChild}
                      onComplete={() => loadProgress(selectedChild)}
                    />
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                          Veuillez sélectionner un enfant pour accéder au quiz
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              {/* Lesson Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Détails de la leçon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {lesson.alignement_socle_commun && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-success" />
                        Alignement programme officiel
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {lesson.alignement_socle_commun}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Objectifs pédagogiques
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>Comprendre et assimiler les concepts fondamentaux</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>Appliquer les connaissances à travers des exercices pratiques</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>Évaluer sa compréhension avec un quiz détaillé</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>Développer des compétences transversales</span>
                      </li>
                    </ul>
                  </div>

                  {lesson.type_contenu === "quiz" && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-secondary" />
                        Format du quiz
                      </h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• 10 questions à choix multiples</p>
                        <p>• Correction immédiate après chaque question</p>
                        <p>• Score détaillé et explications</p>
                        <p>• Possibilité de refaire le quiz</p>
                      </div>
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
                          onClick={handleMarkComplete}
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

              {/* Lesson Stats */}
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Étudiants inscrits
                    </span>
                    <span className="font-bold text-primary">1,234</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Note moyenne
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      <span className="font-bold">4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Taux de réussite
                    </span>
                    <span className="font-bold text-success">98%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Temps moyen
                    </span>
                    <span className="font-bold">{lesson.duree_estimee_minutes} min</span>
                  </div>
                </CardContent>
              </Card>

              {/* Lesson Notes */}
              {selectedChild && lesson.type_contenu === "video" && (
                <LessonNotes
                  lessonId={id!}
                  studentId={selectedChild}
                  currentVideoTime={currentVideoTime}
                />
              )}

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

      <Footer />
    </div>
  );
};

export default LessonDetail;
