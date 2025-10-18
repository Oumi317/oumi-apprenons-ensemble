import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, ArrowLeft, TrendingUp, Clock, BookOpen, Star, Calendar, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProgressCharts } from "@/components/ProgressCharts";
import { useToast } from "@/hooks/use-toast";
import { AchievementBadges } from "@/components/AchievementBadges";
import { StudyStreak } from "@/components/StudyStreak";
import { LevelProgress } from "@/components/LevelProgress";
import { WeeklyChallenges } from "@/components/WeeklyChallenges";
import { PerformanceAnalytics } from "@/components/PerformanceAnalytics";
import { LearningRecommendations } from "@/components/LearningRecommendations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StudentProgress = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    if (!studentId) return;

    // Charger les infos de l'étudiant
    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (studentData) {
      setStudent(studentData);
    }

    // Charger la progression
    const { data: progressData } = await supabase
      .from("student_progress")
      .select(`
        *,
        lessons:lesson_id (
          titre,
          matiere,
          niveau_scolaire,
          type_contenu
        )
      `)
      .eq("etudiant_id", studentId)
      .order("date_debut", { ascending: false });

    if (progressData) {
      setProgress(progressData);
    }

    // Charger les sessions
    const { data: sessionsData } = await supabase
      .from("sessions_tutorat")
      .select(`
        *,
        tutors:tuteur_id (
          profiles:user_id (
            prenom,
            nom
          )
        )
      `)
      .eq("etudiant_id", studentId)
      .order("date_heure_debut", { ascending: false })
      .limit(10);

    if (sessionsData) {
      setSessions(sessionsData);
    }

    // Charger les sessions d'étude
    const { data: studySessionsData } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (studySessionsData) {
      setStudySessions(studySessionsData);
    }

    // Charger les succès
    const { data: achievementsData } = await supabase
      .from("achievements")
      .select("*")
      .eq("student_id", studentId)
      .order("unlocked_at", { ascending: false });

    if (achievementsData) {
      setAchievements(achievementsData);
    }

    setLoading(false);
  };

  const calculateStats = () => {
    const completedLessons = progress.filter((p) => p.statut_completion === 100).length;
    const inProgressLessons = progress.filter(
      (p) => p.statut_completion > 0 && p.statut_completion < 100
    ).length;
    const totalTimeMinutes = progress.reduce((sum, p) => sum + (p.temps_passe_minutes || 0), 0);
    const averageScore = progress.length > 0
      ? progress.reduce((sum, p) => sum + (p.score_quiz || 0), 0) / progress.length
      : 0;

    return {
      completedLessons,
      inProgressLessons,
      totalTimeMinutes,
      totalTimeHours: Math.floor(totalTimeMinutes / 60),
      averageScore: Math.round(averageScore),
      totalSessions: sessions.length,
    };
  };

  const calculateStreak = () => {
    if (studySessions.length === 0) return { current: 0, longest: 0 };
    
    const studyDays = studySessions.map(s => s.created_at);
    const sortedDays = [...studyDays].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastStudy = new Date(sortedDays[0]);
    lastStudy.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      currentStreak = 1;
      
      for (let i = 1; i < sortedDays.length; i++) {
        const current = new Date(sortedDays[i]);
        current.setHours(0, 0, 0, 0);
        const prev = new Date(sortedDays[i - 1]);
        prev.setHours(0, 0, 0, 0);
        
        const diff = Math.floor((prev.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
          currentStreak++;
        } else if (diff > 1) {
          break;
        }
      }
    }
    
    for (let i = 1; i < sortedDays.length; i++) {
      const current = new Date(sortedDays[i]);
      current.setHours(0, 0, 0, 0);
      const prev = new Date(sortedDays[i - 1]);
      prev.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((prev.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, currentStreak, tempStreak);
    
    return { current: currentStreak, longest: longestStreak };
  };

  const preparePerformanceData = () => {
    // Group progress by subject
    const subjectMap = new Map();
    progress.forEach((item) => {
      const matiere = item.lessons?.matiere || "Autre";
      if (!subjectMap.has(matiere)) {
        subjectMap.set(matiere, { total: 0, sum: 0, count: 0 });
      }
      const subj = subjectMap.get(matiere);
      subj.sum += item.score_quiz || 0;
      subj.count += item.score_quiz ? 1 : 0;
      subj.total += 1;
    });

    const subjectPerformance = Array.from(subjectMap.entries()).map(([matiere, data]) => {
      const average = data.count > 0 ? Math.round(data.sum / data.count) : 0;
      // Simple trend calculation based on recent vs older sessions
      const recentSessions = progress.filter(p => p.lessons?.matiere === matiere).slice(0, 3);
      const olderSessions = progress.filter(p => p.lessons?.matiere === matiere).slice(3, 6);
      const recentAvg = recentSessions.length > 0
        ? recentSessions.reduce((sum, p) => sum + (p.score_quiz || 0), 0) / recentSessions.length
        : 0;
      const olderAvg = olderSessions.length > 0
        ? olderSessions.reduce((sum, p) => sum + (p.score_quiz || 0), 0) / olderSessions.length
        : 0;
      
      const trend: "up" | "down" | "stable" = recentAvg > olderAvg + 5 ? "up" : recentAvg < olderAvg - 5 ? "down" : "stable";

      return {
        matiere,
        average,
        trend,
        sessionsCount: data.total,
      };
    });

    // Weekly activity
    const weeklyMap = new Map();
    studySessions.forEach((session) => {
      const date = new Date(session.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { sessions: 0, xpEarned: 0 });
      }
      const week = weeklyMap.get(weekKey);
      week.sessions += 1;
      week.xpEarned += session.score || 0;
    });

    const weeklyActivity = Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([week, data]) => ({
        week: new Date(week).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        ...data,
      }));

    // Quiz performance trend
    const quizPerformance = progress
      .filter((p) => p.score_quiz !== null)
      .slice(0, 10)
      .reverse()
      .map((p) => ({
        date: new Date(p.date_debut).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        score: p.score_quiz || 0,
      }));

    return {
      subjectPerformance,
      weeklyActivity,
      quizPerformance,
      totalStats: {
        totalSessions: studySessions.length,
        totalXP: student.experience_points || 0,
        averageScore: stats.averageScore,
        studyHours: stats.totalTimeHours,
      },
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const stats = calculateStats();
  const { current: currentStreak, longest: longestStreak } = calculateStreak();
  const studyDays = studySessions.map(s => s.created_at);
  const performanceData = preparePerformanceData();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard/parent" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Oumi'School
            </h1>
          </Link>
          <Link to="/dashboard/parent">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Student Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Progrès de {student.prenom}</h2>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {student.niveau_scolaire}
                </Badge>
                {student.besoins_specifiques && (
                  <Badge variant="secondary">
                    {student.besoins_specifiques}
                  </Badge>
                )}
              </div>
            </div>
            <Button className="bg-gradient-primary">
              <Calendar className="h-4 w-4 mr-2" />
              Télécharger le rapport
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Leçons complétées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">{stats.completedLessons}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.inProgressLessons} en cours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Temps d'étude
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.totalTimeHours}h</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalTimeMinutes % 60}min
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Score moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{stats.averageScore}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sur les quiz complétés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Sessions tutorat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sessions complétées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Level & Challenges */}
          <div className="grid md:grid-cols-2 gap-6">
            <LevelProgress 
              level={student.niveau || 1}
              experience={student.experience_points || 0}
              studentName={student.prenom}
            />
            <WeeklyChallenges studentId={studentId!} />
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
              <TabsTrigger value="activity">Activité</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Progress Charts & Achievements */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ProgressCharts 
                    studySessions={studySessions}
                    achievements={achievements}
                    studentName={student.prenom}
                  />
                </div>
                <StudyStreak 
                  currentStreak={currentStreak}
                  longestStreak={longestStreak}
                  studyDays={studyDays}
                />
              </div>

              {/* Achievements */}
              <AchievementBadges achievements={achievements} />

              {/* Progress by Subject */}
              <Card>
                <CardHeader>
                  <CardTitle>Progression par matière</CardTitle>
                  <CardDescription>
                    Vue d'ensemble des matières étudiées
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {["Français", "Mathématiques", "Histoire-Géographie", "Sciences"].map((matiere) => {
                    const matiereLessons = progress.filter(
                      (p) => p.lessons?.matiere === matiere
                    );
                    const completed = matiereLessons.filter((p) => p.statut_completion === 100).length;
                    const total = matiereLessons.length;
                    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                      <div key={matiere} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{matiere}</span>
                            <Badge variant="secondary" className="text-xs">
                              {completed}/{total} leçons
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold text-primary">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <PerformanceAnalytics data={performanceData} />
            </TabsContent>

            <TabsContent value="recommendations">
              <LearningRecommendations
                studentId={studentId!}
                currentLevel={student.niveau_scolaire}
                weakSubjects={
                  performanceData.subjectPerformance
                    .filter((s) => s.average < 70)
                    .map((s) => s.matiere)
                }
                strongSubjects={
                  performanceData.subjectPerformance
                    .filter((s) => s.average >= 80)
                    .map((s) => s.matiere)
                }
                recentScores={
                  progress
                    .filter((p) => p.score_quiz !== null)
                    .slice(0, 5)
                    .map((p) => p.score_quiz || 0)
                }
              />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {/* Recent Activity */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Lessons */}
                <Card>
                  <CardHeader>
                    <CardTitle>Leçons récentes</CardTitle>
                    <CardDescription>Dernières leçons étudiées</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {progress.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.lessons?.titre}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {item.lessons?.matiere}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.date_debut).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">{item.statut_completion}%</div>
                          {item.statut_completion === 100 && (
                            <Award className="h-4 w-4 text-success inline" />
                          )}
                        </div>
                      </div>
                    ))}
                    {progress.length === 0 && (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Aucune leçon commencée pour le moment
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sessions de tutorat</CardTitle>
                    <CardDescription>Historique des sessions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{session.matiere}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            avec {session.tutors?.profiles?.prenom} {session.tutors?.profiles?.nom}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {new Date(session.date_heure_debut).toLocaleDateString('fr-FR')}
                            </span>
                            <Badge
                              variant="secondary"
                              className={
                                session.statut === "completee"
                                  ? "bg-success/10 text-success text-xs"
                                  : "text-xs"
                              }
                            >
                              {session.statut}
                            </Badge>
                          </div>
                        </div>
                        {session.evaluation_etudiant && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-secondary text-secondary" />
                            <span className="text-sm font-semibold">{session.evaluation_etudiant}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {sessions.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Aucune session réservée pour le moment
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Recommendations */}
          <Card className="bg-gradient-primary text-white border-0">
            <CardContent className="py-8">
              <div className="flex items-start gap-4">
                <TrendingUp className="h-8 w-8 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Recommandations</h3>
                  <p className="text-white/90 mb-4">
                    Continuez sur cette lancée ! Voici quelques suggestions pour progresser encore plus :
                  </p>
                  <ul className="space-y-2 text-sm text-white/90">
                    <li>• Complétez les leçons en cours en Mathématiques</li>
                    <li>• Réservez une session de révision avant le prochain contrôle</li>
                    <li>• Explorez les leçons de niveau supérieur pour approfondir</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentProgress;
