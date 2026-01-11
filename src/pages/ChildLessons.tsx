import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Play, CheckCircle, Clock, Loader2, ArrowLeft, 
  LogOut, Timer, Sparkles, Star
} from "lucide-react";
import { motion } from "framer-motion";
import { useChildSession } from "@/contexts/ChildSessionContext";

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

const matiereColors: { [key: string]: string } = {
  "Français": "bg-blue-500/20 text-blue-600 border-blue-300",
  "Mathématiques": "bg-green-500/20 text-green-600 border-green-300",
  "Sciences": "bg-purple-500/20 text-purple-600 border-purple-300",
  "Histoire": "bg-orange-500/20 text-orange-600 border-orange-300",
  "Géographie": "bg-teal-500/20 text-teal-600 border-teal-300",
  "Anglais": "bg-red-500/20 text-red-600 border-red-300",
  "Histoire-Géographie": "bg-amber-500/20 text-amber-600 border-amber-300",
};

const matiereIcons: { [key: string]: string } = {
  "Français": "📚",
  "Mathématiques": "🔢",
  "Sciences": "🔬",
  "Histoire": "🏛️",
  "Géographie": "🌍",
  "Anglais": "🇬🇧",
  "Histoire-Géographie": "🗺️",
};

const difficulteLabels: { [key: string]: string } = {
  "facile": "⭐ Facile",
  "moyen": "⭐⭐ Moyen",
  "difficile": "⭐⭐⭐ Difficile"
};

const ChildLessons = () => {
  const navigate = useNavigate();
  const { childSession, isChildMode, endChildSession, timeRemaining } = useChildSession();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);
  const [matieres, setMatieres] = useState<string[]>([]);

  useEffect(() => {
    if (!isChildMode || !childSession) {
      navigate("/parent-dashboard");
      return;
    }
    loadLessons();
  }, [isChildMode, childSession]);

  const loadLessons = async () => {
    if (!childSession) return;

    try {
      const { data: lessonsData, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("niveau_scolaire", childSession.niveauScolaire as any)
        .order("ordre_affichage", { ascending: true });

      if (error) throw error;

      // Get student progress
      const { data: progressData } = await supabase
        .from("student_progress")
        .select("lesson_id, statut_completion")
        .eq("etudiant_id", childSession.studentId);

      const progressMap = new Map(
        progressData?.map(p => [p.lesson_id, p.statut_completion]) || []
      );

      const lessonsWithProgress = lessonsData?.map(lesson => ({
        ...lesson,
        progress: progressMap.get(lesson.id) || 0,
        completed: (progressMap.get(lesson.id) || 0) >= 100
      })) || [];

      // Get unique subjects
      const uniqueMatieres = [...new Set(lessonsWithProgress.map(l => l.matiere))];
      setMatieres(uniqueMatieres);

      setLessons(lessonsWithProgress);
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExitChildMode = () => {
    endChildSession();
    navigate("/parent-dashboard");
  };

  const filteredLessons = selectedMatiere 
    ? lessons.filter(l => l.matiere === selectedMatiere)
    : lessons;

  const completedCount = lessons.filter(l => l.completed).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Child Session Header */}
      <div className="bg-primary text-primary-foreground py-3 px-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">
              {childSession?.studentName}
            </span>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {childSession?.niveauScolaire}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
              <Timer className="h-4 w-4" />
              <span className="font-medium">{timeRemaining} min restantes</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExitChildMode}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Quitter
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/student-dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à mon espace
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            📚 Mes Leçons
          </h1>
          <p className="text-muted-foreground">
            Choisis une leçon pour apprendre de nouvelles choses !
          </p>
          
          {/* Progress Overview */}
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">
              {completedCount}/{lessons.length} leçons terminées
            </span>
          </div>
        </motion.div>

        {/* Subject Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedMatiere === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMatiere(null)}
              className="rounded-full"
            >
              Toutes les matières
            </Button>
            {matieres.map((matiere) => (
              <Button
                key={matiere}
                variant={selectedMatiere === matiere ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMatiere(matiere)}
                className="rounded-full gap-2"
              >
                <span>{matiereIcons[matiere] || "📖"}</span>
                {matiere}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Aucune leçon trouvée</h3>
              <p className="text-muted-foreground">
                Il n'y a pas encore de leçons pour ton niveau.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/lessons/${lesson.id}`}>
                  <Card className={`
                    h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer
                    ${lesson.completed 
                      ? 'border-green-300 bg-green-50/50 dark:bg-green-900/10' 
                      : 'hover:border-primary/50'
                    }
                  `}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {matiereIcons[lesson.matiere] || "📖"}
                          </span>
                          <Badge 
                            variant="outline"
                            className={matiereColors[lesson.matiere] || "bg-gray-100"}
                          >
                            {lesson.matiere}
                          </Badge>
                        </div>
                        {lesson.completed && (
                          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2 line-clamp-2">
                        {lesson.titre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {lesson.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="secondary">
                          {difficulteLabels[lesson.difficulte] || lesson.difficulte}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {lesson.duree_estimee_minutes} min
                        </div>
                      </div>

                      {/* Progress */}
                      {lesson.progress > 0 && (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="text-primary font-medium">{lesson.progress}%</span>
                          </div>
                          <Progress value={lesson.progress} className="h-2" />
                        </div>
                      )}

                      {/* Action Button */}
                      <Button 
                        className="w-full gap-2" 
                        variant={lesson.completed ? "outline" : "default"}
                      >
                        {lesson.completed ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Revoir
                          </>
                        ) : lesson.progress > 0 ? (
                          <>
                            <Play className="h-4 w-4" />
                            Continuer
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Commencer
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildLessons;
