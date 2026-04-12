import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BookOpen, Trophy, Target, Flame, Users, LogOut, Clock, Calendar, Gamepad2, Play, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { LevelProgress } from "@/components/LevelProgress";
import { StudyStreak } from "@/components/StudyStreak";
import { AchievementBadges } from "@/components/AchievementBadges";
import { WeeklyChallenges } from "@/components/WeeklyChallenges";
import { XPGainPopup } from "@/components/XPGainPopup";
import { StudentLeaderboard } from "@/components/StudentLeaderboard";
import { ChildPlanning } from "@/components/ChildPlanning";
import { ChildMiniGames } from "@/components/ChildMiniGames";
import { ChildRiddle } from "@/components/ChildRiddle";
import { LessonViewerDialog } from "@/components/LessonViewerDialog";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useChildSession } from "@/contexts/ChildSessionContext";

interface Student {
  id: string;
  prenom: string;
  niveau_scolaire: string;
  niveau: number;
  experience_points: number;
  current_streak: number;
  longest_streak: number;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked_at: string;
}

interface Lesson {
  id: string;
  titre: string;
  description: string;
  matiere: string;
  duree_estimee_minutes: number;
  difficulte: string;
  type_contenu: string;
  progress: number;
  completed: boolean;
}

const matiereColors: Record<string, string> = {
  "Français": "bg-blue-500/15 text-blue-600 border-blue-200",
  "Mathématiques": "bg-green-500/15 text-green-600 border-green-200",
  "Sciences": "bg-purple-500/15 text-purple-600 border-purple-200",
  "Histoire": "bg-orange-500/15 text-orange-600 border-orange-200",
  "Géographie": "bg-teal-500/15 text-teal-600 border-teal-200",
  "Anglais": "bg-red-500/15 text-red-600 border-red-200",
  "Histoire-Géographie": "bg-amber-500/15 text-amber-600 border-amber-200",
};

const matiereEmoji: Record<string, string> = {
  "Français": "📚",
  "Mathématiques": "🔢",
  "Sciences": "🔬",
  "Histoire": "🏛️",
  "Géographie": "🌍",
  "Anglais": "🇬🇧",
  "Histoire-Géographie": "🗺️",
};

const difficulteLabels: Record<string, string> = {
  "facile": "⭐ Facile",
  "moyen": "⭐⭐ Moyen",
  "difficile": "⭐⭐⭐ Difficile",
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { childSession, endChildSession, isChildMode, timeRemaining } = useChildSession();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studyDays, setStudyDays] = useState<string[]>([]);
  const [xpGain, setXpGain] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);
  const [viewerLessonId, setViewerLessonId] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    if (!isChildMode || !childSession) {
      navigate("/child-profiles");
      return;
    }
    loadStudentData(childSession.studentId);
  }, [isChildMode, childSession]);

  // Realtime subscription for achievements
  useEffect(() => {
    if (!student) return;
    const channel = supabase
      .channel('student-achievements')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'achievements',
        filter: `student_id=eq.${student.id}`
      }, (payload) => {
        const newAchievement = payload.new as Achievement;
        setAchievements(prev => [newAchievement, ...prev]);
        handleXPGain(newAchievement.points);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [student?.id]);

  // Realtime subscription for XP updates
  useEffect(() => {
    if (!student) return;
    const channel = supabase
      .channel('student-xp')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'students',
        filter: `id=eq.${student.id}`
      }, (payload) => {
        const updated = payload.new as Student;
        if (updated.experience_points > student.experience_points) {
          setXpGain({ amount: updated.experience_points - student.experience_points, show: true });
        }
        setStudent(updated);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [student?.id, student?.experience_points]);

  const loadStudentData = async (studentId: string) => {
    try {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, parent_id, user_id, prenom, date_naissance, niveau_scolaire, besoins_specifiques, objectifs_apprentissage, niveau, experience_points, current_streak, longest_streak, created_at, updated_at")
        .eq("id", studentId)
        .single();

      if (studentError || !studentData) {
        endChildSession();
        navigate("/child-profiles");
        return;
      }
      setStudent(studentData);

      // Load achievements, study days, and lessons in parallel
      const [achievementsRes, studyRes, lessonsRes, progressRes] = await Promise.all([
        supabase.from("achievements").select("*").eq("student_id", studentData.id).order("unlocked_at", { ascending: false }),
        supabase.from("study_sessions").select("created_at").eq("student_id", studentData.id).eq("completed", true).gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("lessons").select("id, titre, description, matiere, duree_estimee_minutes, difficulte, type_contenu").eq("niveau_scolaire", studentData.niveau_scolaire as any).order("ordre_affichage", { ascending: true }),
        supabase.from("student_progress").select("lesson_id, statut_completion").eq("etudiant_id", studentData.id),
      ]);

      if (achievementsRes.data) setAchievements(achievementsRes.data);

      if (studyRes.data) {
        const days = studyRes.data.map(s => new Date(s.created_at).toISOString().split("T")[0]);
        setStudyDays([...new Set(days)]);
      }

      const progressMap = new Map(progressRes.data?.map(p => [p.lesson_id, p.statut_completion ?? 0]) || []);
      const lessonsWithProgress = lessonsRes.data?.map(l => ({
        ...l,
        duree_estimee_minutes: l.duree_estimee_minutes ?? 30,
        difficulte: l.difficulte ?? "moyen",
        description: l.description ?? "",
        progress: progressMap.get(l.id) || 0,
        completed: (progressMap.get(l.id) || 0) >= 100,
      })) || [];
      setLessons(lessonsWithProgress);
    } catch (error) {
      console.error("Error loading student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleXPGain = (amount: number) => {
    setXpGain({ amount, show: true });
    if (student) {
      setStudent({ ...student, experience_points: student.experience_points + amount });
    }
  };

  const handleExitChildMode = () => {
    endChildSession();
    navigate("/parent-dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student || !isChildMode) return null;

  const matieres = [...new Set(lessons.map(l => l.matiere))];
  const filteredLessons = selectedMatiere ? lessons.filter(l => l.matiere === selectedMatiere) : lessons;
  const completedCount = lessons.filter(l => l.completed).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-accent/5 to-background">
      {/* Child session bar */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {student.prenom.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="font-medium text-foreground">
              Mode enfant : {student.prenom}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{timeRemaining} min restantes</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleExitChildMode} className="gap-2">
              <LogOut className="h-4 w-4" />
              Quitter
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Bonjour {student.prenom} ! 👋
          </h1>
          <p className="text-muted-foreground">Prêt pour une nouvelle journée d'apprentissage ?</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Trophy, label: "Niveau", value: student.niveau, color: "text-primary", bg: "bg-primary/10" },
            { icon: Target, label: "XP Total", value: student.experience_points, color: "text-accent", bg: "bg-accent/10" },
            { icon: Flame, label: "Jours de suite", value: student.current_streak, color: "text-orange-500", bg: "bg-orange-500/10" },
            { icon: BookOpen, label: "Succès", value: achievements.length, color: "text-green-500", bg: "bg-green-500/10" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-card rounded-xl p-4 border border-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="planning" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="planning" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Planning</span>
            </TabsTrigger>
            <TabsTrigger value="lecons" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Mes Leçons</span>
            </TabsTrigger>
            <TabsTrigger value="defis" className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden sm:inline">Défis</span>
            </TabsTrigger>
            <TabsTrigger value="classement" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Classement</span>
            </TabsTrigger>
          </TabsList>

          {/* PLANNING */}
          <TabsContent value="planning" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChildPlanning studentId={student.id} niveauScolaire={student.niveau_scolaire} onOpenLesson={(id) => { setViewerLessonId(id); setViewerOpen(true); }} />
              </div>
              <div className="space-y-6">
                <LevelProgress level={student.niveau} experience={student.experience_points} studentName={student.prenom} />
                <StudyStreak currentStreak={student.current_streak} longestStreak={student.longest_streak} studyDays={studyDays} />
              </div>
            </div>
          </TabsContent>

          {/* MES LEÇONS */}
          <TabsContent value="lecons" className="space-y-6">
            {/* Subject filter */}
            <div className="flex flex-wrap gap-2">
              <Button variant={selectedMatiere === null ? "default" : "outline"} size="sm" onClick={() => setSelectedMatiere(null)} className="rounded-full">
                Toutes ({lessons.length})
              </Button>
              {matieres.map(m => (
                <Button key={m} variant={selectedMatiere === m ? "default" : "outline"} size="sm" onClick={() => setSelectedMatiere(m)} className="rounded-full gap-1">
                  <span>{matiereEmoji[m] || "📖"}</span> {m}
                </Button>
              ))}
            </div>

            {/* Progress summary */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {completedCount}/{lessons.length} leçons terminées
            </div>

            {/* Lessons grid */}
            {filteredLessons.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Aucune leçon trouvée.</p>
              </CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLessons.map((lesson, i) => (
                  <motion.div key={lesson.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <div onClick={() => { setViewerLessonId(lesson.id); setViewerOpen(true); }}>
                      <Card className={`h-full transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${lesson.completed ? "border-green-300 bg-green-50/30 dark:bg-green-900/10" : "hover:border-primary/50"}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <Badge variant="outline" className={matiereColors[lesson.matiere] || ""}>
                              {matiereEmoji[lesson.matiere] || "📖"} {lesson.matiere}
                            </Badge>
                            {lesson.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                          </div>
                          <CardTitle className="text-base mt-2 line-clamp-2">{lesson.titre}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="secondary">{difficulteLabels[lesson.difficulte] || lesson.difficulte}</Badge>
                            <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" />{lesson.duree_estimee_minutes} min</span>
                          </div>
                          {lesson.progress > 0 && lesson.progress < 100 && (
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Progression</span>
                                <span className="text-primary font-medium">{lesson.progress}%</span>
                              </div>
                              <Progress value={lesson.progress} className="h-1.5" />
                            </div>
                          )}
                          <Button className="w-full gap-2" size="sm" variant={lesson.completed ? "outline" : "default"}>
                            {lesson.completed ? <><CheckCircle className="h-4 w-4" /> Revoir</> : <><Play className="h-4 w-4" /> {lesson.progress > 0 ? "Continuer" : "Commencer"}</>}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* DÉFIS */}
          <TabsContent value="defis" className="space-y-6">
            <ChildRiddle onXPGain={handleXPGain} />
            <div className="grid lg:grid-cols-2 gap-6">
              <WeeklyChallenges studentId={student.id} />
              <ChildMiniGames studentId={student.id} niveauScolaire={student.niveau_scolaire} onXPGain={handleXPGain} />
            </div>
          </TabsContent>

          {/* CLASSEMENT */}
          <TabsContent value="classement" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <StudentLeaderboard studentId={student.id} niveauScolaire={student.niveau_scolaire} />
              </div>
              <div className="space-y-6">
                <LevelProgress level={student.niveau} experience={student.experience_points} studentName={student.prenom} />
                <AchievementBadges achievements={achievements} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      <XPGainPopup amount={xpGain.amount} show={xpGain.show} onComplete={() => setXpGain({ ...xpGain, show: false })} />
    </div>
  );
}
