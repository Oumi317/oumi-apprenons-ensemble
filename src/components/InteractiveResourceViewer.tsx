import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Maximize2, Minimize2, X, Loader2, Trophy, BookOpen } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProgressData {
  completedLessons: number[];
  lessonScores: Record<string, number>;
  totalLessons: number;
  completedCount: number;
  averageScore: number;
  certificateEarned: boolean;
}

interface InteractiveResourceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  resourceUrl: string;
  titre: string;
  resourceId?: string;
  studentId?: string;
}

export function InteractiveResourceViewer({
  isOpen,
  onClose,
  resourceUrl,
  titre,
  resourceId,
  studentId,
}: InteractiveResourceViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentProgress, setCurrentProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    const loadHtmlContent = async () => {
      if (!resourceUrl || !isOpen) return;
      
      setLoading(true);
      try {
        const response = await fetch(resourceUrl);
        const html = await response.text();
        setHtmlContent(html);
        
        // Charger la progression existante
        if (resourceId && studentId) {
          loadExistingProgress();
        }
      } catch (error) {
        console.error("Erreur lors du chargement du contenu HTML:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHtmlContent();
  }, [resourceUrl, isOpen, resourceId, studentId]);

  // Écouter les messages de progression de l'iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'CREADOC_PROGRESS_UPDATE') {
        const progressData = event.data as ProgressData & { type: string };
        setCurrentProgress(progressData);
        
        // Sauvegarder dans la base de données
        if (studentId && resourceId) {
          await saveProgressToDatabase(progressData);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [studentId, resourceId]);

  const loadExistingProgress = async () => {
    if (!resourceId || !studentId) return;

    try {
      const { data: progress } = await supabase
        .from("interactive_resource_progress")
        .select("*")
        .eq("student_id", studentId)
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
    } catch (error) {
      console.error("Erreur lors du chargement de la progression:", error);
    }
  };

  const saveProgressToDatabase = useCallback(async (progressData: ProgressData) => {
    if (!studentId || !resourceId) return;

    try {
      const { error } = await supabase
        .from("interactive_resource_progress")
        .upsert({
          student_id: studentId,
          resource_id: resourceId,
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

      if (progressData.certificateEarned) {
        toast.success("🎓 Félicitations ! Certificat obtenu !", {
          description: "Ta progression a été sauvegardée."
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la progression:", error);
    }
  }, [studentId, resourceId]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const progressPercent = currentProgress 
    ? Math.round((currentProgress.completedCount / currentProgress.totalLessons) * 100) 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? "w-screen h-screen max-w-none m-0 p-0 rounded-none" 
            : "max-w-6xl h-[90vh]"
        } transition-all duration-300`}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-lg font-semibold">{titre}</DialogTitle>
              {currentProgress && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {currentProgress.completedCount}/{currentProgress.totalLessons}
                  </Badge>
                  {currentProgress.certificateEarned && (
                    <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 text-xs">
                      <Trophy className="h-3 w-3 mr-1" />
                      Certifié
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {currentProgress && (
            <div className="mt-2">
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-forms allow-popups allow-modals"
              title={titre}
              style={{ 
                height: isFullscreen ? "calc(100vh - 80px)" : "calc(90vh - 80px)" 
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
