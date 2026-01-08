import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, GraduationCap, Trophy, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface InteractiveResource {
  id: string;
  titre: string;
  description: string;
  file_url: string;
  lesson_id: string | null;
  lessons?: {
    titre: string;
    matiere: string;
    niveau_scolaire: string;
  };
}

interface ProgressData {
  completedLessons: number[];
  lessonScores: Record<string, number>;
  totalLessons: number;
  completedCount: number;
  averageScore: number;
  certificateEarned: boolean;
}

export default function InteractiveResource() {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<InteractiveResource | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    loadResource();
    checkUserAndStudent();
  }, [id]);

  // Écouter les messages de progression de l'iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'CREADOC_PROGRESS_UPDATE') {
        const progressData = event.data as ProgressData & { type: string };
        setCurrentProgress(progressData);
        
        // Sauvegarder dans la base de données si un étudiant est connecté
        if (studentId && resource?.id) {
          await saveProgressToDatabase(progressData);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [studentId, resource?.id]);

  const checkUserAndStudent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Vérifier si c'est un étudiant
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (student) {
        setStudentId(student.id);
        return;
      }

      // Sinon vérifier si c'est un parent avec des enfants
      const { data: children } = await supabase
        .from("students")
        .select("id")
        .eq("parent_id", user.id)
        .limit(1);

      if (children && children.length > 0) {
        // Pour l'instant, utiliser le premier enfant
        // TODO: Permettre de choisir l'enfant
        setStudentId(children[0].id);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'utilisateur:", error);
    }
  };

  const saveProgressToDatabase = useCallback(async (progressData: ProgressData) => {
    if (!studentId || !resource?.id) return;

    try {
      const { error } = await supabase
        .from("interactive_resource_progress")
        .upsert({
          student_id: studentId,
          resource_id: resource.id,
          completed_lessons: progressData.completedLessons,
          lesson_scores: progressData.lessonScores,
          total_lessons: progressData.totalLessons,
          completed_count: progressData.completedCount,
          average_score: progressData.averageScore,
          certificate_earned: progressData.certificateEarned,
          certificate_date: progressData.certificateEarned ? new Date().toISOString() : null,
          last_accessed_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id,resource_id'
        });

      if (error) throw error;

      // Afficher un toast si certificat obtenu
      if (progressData.certificateEarned) {
        toast.success("🎓 Félicitations ! Tu as obtenu ton certificat !", {
          description: "Ta progression a été sauvegardée."
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la progression:", error);
    }
  }, [studentId, resource?.id]);

  const loadResource = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("interactive_resources")
        .select(`
          *,
          lessons (
            titre,
            matiere,
            niveau_scolaire
          )
        `)
        .eq("slug", id)
        .maybeSingle();

      if (error) throw error;
      setResource(data);

      // Fetch the HTML content to bypass content-type issues
      if (data?.file_url) {
        const response = await fetch(data.file_url);
        const html = await response.text();
        setHtmlContent(html);
      }

      // Charger la progression existante si connecté
      if (data?.id) {
        loadExistingProgress(data.id);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la ressource:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingProgress = async (resourceId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Trouver l'étudiant
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .or(`user_id.eq.${user.id},parent_id.eq.${user.id}`)
      .limit(1)
      .maybeSingle();

    if (!student) return;

    const { data: progress } = await supabase
      .from("interactive_resource_progress")
      .select("*")
      .eq("student_id", student.id)
      .eq("resource_id", resourceId)
      .maybeSingle();

    if (progress) {
      setCurrentProgress({
        completedLessons: progress.completed_lessons as number[],
        lessonScores: progress.lesson_scores as Record<string, number>,
        totalLessons: progress.total_lessons,
        completedCount: progress.completed_count,
        averageScore: Number(progress.average_score),
        certificateEarned: progress.certificate_earned,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Ressource non trouvée</h1>
        <Link to="/lessons">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux cours
          </Button>
        </Link>
      </div>
    );
  }

  const progressPercent = currentProgress 
    ? Math.round((currentProgress.completedCount / currentProgress.totalLessons) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/lessons" className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-display font-bold text-lg hidden sm:inline">Oumi'School</span>
              </Link>
              <Link to="/lessons">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <h1 className="text-lg font-bold font-display">{resource.titre}</h1>
                {resource.lessons && (
                  <p className="text-xs text-muted-foreground">
                    {resource.lessons.matiere} - {resource.lessons.niveau_scolaire}
                  </p>
                )}
              </div>
              <ThemeToggle />
            </div>
          </div>
          
          {/* Barre de progression */}
          {currentProgress && (
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {currentProgress.completedCount}/{currentProgress.totalLessons} leçons
                  </span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
              {currentProgress.averageScore > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Score: {currentProgress.averageScore}%
                </Badge>
              )}
              {currentProgress.certificateEarned && (
                <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                  <Trophy className="h-3 w-3 mr-1" />
                  Certifié
                </Badge>
              )}
            </div>
          )}
          
          {resource.description && (
            <p className="mt-2 text-muted-foreground text-sm">{resource.description}</p>
          )}
        </div>
      </header>

      <main className="h-[calc(100vh-180px)]">
        <iframe
          srcDoc={htmlContent}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title={resource.titre}
        />
      </main>
    </div>
  );
}
