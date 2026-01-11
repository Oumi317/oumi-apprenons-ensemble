import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Play, CheckCircle, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Lesson {
  id: string;
  titre: string;
  description: string;
  matiere: string;
  niveau_scolaire: string;
  duree_estimee_minutes: number;
  difficulte: string;
  type_contenu: string;
  progress?: number;
  completed?: boolean;
}

interface DailyLessonsProps {
  studentId: string;
  niveauScolaire: string;
  onXPGain?: (amount: number) => void;
  isChildMode?: boolean;
}

const matiereColors: { [key: string]: string } = {
  "Français": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Mathématiques": "bg-green-500/10 text-green-600 border-green-200",
  "Sciences": "bg-purple-500/10 text-purple-600 border-purple-200",
  "Histoire": "bg-orange-500/10 text-orange-600 border-orange-200",
  "Géographie": "bg-teal-500/10 text-teal-600 border-teal-200",
};

const difficulteLabels: { [key: string]: string } = {
  "facile": "Facile",
  "moyen": "Moyen",
  "difficile": "Difficile"
};

export function DailyLessons({ studentId, niveauScolaire, onXPGain, isChildMode = false }: DailyLessonsProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, [studentId, niveauScolaire]);

  const loadLessons = async () => {
    try {
      // Get lessons for student's level
      const { data: lessonsData, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("niveau_scolaire", niveauScolaire as any)
        .order("ordre_affichage", { ascending: true })
        .limit(6);

      if (error) throw error;

      // Get student progress for these lessons
      const { data: progressData } = await supabase
        .from("student_progress")
        .select("lesson_id, statut_completion")
        .eq("etudiant_id", studentId);

      const progressMap = new Map(
        progressData?.map(p => [p.lesson_id, p.statut_completion]) || []
      );

      const lessonsWithProgress = lessonsData?.map(lesson => ({
        ...lesson,
        progress: progressMap.get(lesson.id) || 0,
        completed: (progressMap.get(lesson.id) || 0) >= 100
      })) || [];

      setLessons(lessonsWithProgress);
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Mes leçons du jour
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lessons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Aucune leçon disponible pour ton niveau.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/lessons/${lesson.id}`}>
                  <div 
                    className={`
                      group p-4 rounded-xl border transition-all duration-300
                      ${lesson.completed 
                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                        : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      {/* Lesson Icon */}
                      <div className={`
                        p-3 rounded-xl flex-shrink-0
                        ${lesson.completed 
                          ? 'bg-green-500/10' 
                          : 'bg-primary/10 group-hover:bg-primary/20'
                        }
                      `}>
                        {lesson.completed ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <Play className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      
                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground truncate">
                            {lesson.titre}
                          </h4>
                          {lesson.completed && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">
                              Terminé
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {lesson.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={matiereColors[lesson.matiere] || "bg-gray-100"}
                          >
                            {lesson.matiere}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {difficulteLabels[lesson.difficulte] || lesson.difficulte}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {lesson.duree_estimee_minutes} min
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {lesson.progress > 0 && lesson.progress < 100 && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progression</span>
                              <span className="text-primary font-medium">{lesson.progress}%</span>
                            </div>
                            <Progress value={lesson.progress} className="h-1.5" />
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button 
                        size="sm" 
                        variant={lesson.completed ? "outline" : "default"}
                        className="flex-shrink-0"
                      >
                        {lesson.completed ? "Revoir" : "Commencer"}
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        
        {lessons.length > 0 && (
          <div className="pt-4 text-center">
            <Link to={isChildMode ? "/child-lessons" : "/lessons"}>
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Voir toutes les leçons
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
