import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Calendar, LogOut, Plus, Sparkles, Clock, TrendingUp, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddChildDialog } from "@/components/AddChildDialog";
import { ChildCard } from "@/components/ChildCard";
import { UpcomingSessions } from "@/components/UpcomingSessions";
import { RecentActivity } from "@/components/RecentActivity";
import { QuickStats } from "@/components/QuickStats";
import { SessionCalendar } from "@/components/SessionCalendar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ProgressOverview } from "@/components/ProgressOverview";
import { HelpButton } from "@/components/HelpButton";
import BudgetManagement from "@/components/BudgetManagement";
import FavoriteTutors from "@/components/FavoriteTutors";
import FamilyCalendar from "@/components/FamilyCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TutorChat from "@/components/TutorChat";
import { NotificationCenter } from "@/components/NotificationCenter";
import { PerformanceAnalytics } from "@/components/PerformanceAnalytics";
import { LearningRecommendations } from "@/components/LearningRecommendations";
import { RealtimeDashboardMetrics } from "@/components/RealtimeDashboardMetrics";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    } else {
      setUser(user);
      await loadChildren(user.id);
    }
    setLoading(false);
  };

  const loadChildren = async (userId: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("parent_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading children:", error);
    } else {
      setChildren(data || []);
      if (data && data.length > 0) {
        await loadSessionsData(data.map(c => c.id));
        await loadActivities(data.map(c => c.id));
      }
    }
  };

  const loadSessionsData = async (studentIds: string[]) => {
    const { data, error } = await supabase
      .from("sessions_tutorat")
      .select(`
        *,
        tutors (
          profiles (prenom, nom)
        )
      `)
      .in("etudiant_id", studentIds)
      .order("date_heure_debut", { ascending: true });

    if (!error && data) {
      setTotalSessions(data.length);
      const upcoming = data
        .filter(s => new Date(s.date_heure_debut) >= new Date() && s.statut === "programmee")
        .slice(0, 5);
      setUpcomingSessions(upcoming);
    }
  };

  const loadActivities = async (studentIds: string[]) => {
    // Load recent quiz attempts and achievements
    const { data: quizData } = await supabase
      .from("quiz_attempts")
      .select("*, students (prenom), lessons (titre)")
      .in("student_id", studentIds)
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: achievementData } = await supabase
      .from("achievements")
      .select("*, students (prenom)")
      .in("student_id", studentIds)
      .order("unlocked_at", { ascending: false })
      .limit(5);

    const activities: any[] = [];

    quizData?.forEach(quiz => {
      activities.push({
        id: quiz.id,
        type: "quiz",
        title: "Quiz complété",
        description: `${quiz.students?.prenom} a terminé le quiz "${quiz.lessons?.titre}" avec ${quiz.percentage}%`,
        timestamp: new Date(quiz.created_at),
        studentName: quiz.students?.prenom,
        points: quiz.score,
      });
    });

    achievementData?.forEach(achievement => {
      activities.push({
        id: achievement.id,
        type: "achievement",
        title: achievement.title,
        description: achievement.description,
        timestamp: new Date(achievement.unlocked_at),
        studentName: achievement.students?.prenom,
        points: achievement.points,
      });
    });

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setRecentActivities(activities.slice(0, 10));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur Oumi'School !",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Oumi'School
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Bienvenue, {user?.user_metadata?.first_name} !
            </h2>
            <p className="text-muted-foreground">
              Gérez l'éducation de vos enfants depuis votre tableau de bord
            </p>
          </div>

          {/* Quick Stats */}
          <QuickStats
            stats={[
              {
                label: "Enfants inscrits",
                value: children.length,
                icon: <Users className="h-5 w-5" />,
                color: "bg-primary/10 text-primary",
                change: children.length > 0 ? 100 : undefined,
              },
              {
                label: "Sessions ce mois",
                value: totalSessions,
                icon: <Calendar className="h-5 w-5" />,
                color: "bg-secondary/10 text-secondary",
                change: totalSessions > 0 ? 15 : undefined,
              },
              {
                label: "Heures d'apprentissage",
                value: `${totalSessions * 1}h`,
                icon: <Clock className="h-5 w-5" />,
                color: "bg-success/10 text-success",
                change: totalSessions > 0 ? 8 : undefined,
              },
              {
                label: "Progression moyenne",
                value: "92%",
                icon: <TrendingUp className="h-5 w-5" />,
                color: "bg-blue-500/10 text-blue-500",
                change: 12,
              },
            ]}
          />

          {/* Children List */}
          {children.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Mes enfants</h3>
                  <p className="text-muted-foreground">
                    Gérez l'éducation de chaque enfant individuellement
                  </p>
                </div>
                <AddChildDialog onChildAdded={() => checkUser()} />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map((child) => (
                  <ChildCard key={child.id} child={child} />
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            {children.length === 0 && (
              <Card className="border-2 border-primary/20 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Mes enfants
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Ajoutez et gérez les profils de vos enfants
                      </CardDescription>
                    </div>
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <AddChildDialog onChildAdded={() => checkUser()} />
                </CardContent>
              </Card>
            )}

            <Card className="border-2 hover:border-secondary transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-secondary" />
                      Réserver une session
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Trouvez un tuteur et réservez un cours en visio
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link to="/tutors">
                  <Button variant="outline" className="w-full">
                    Parcourir les tuteurs
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-success transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-success" />
                      Bibliothèque de ressources
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Accédez à des milliers de leçons et exercices
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link to="/lessons">
                  <Button variant="outline" className="w-full">
                    Explorer les ressources
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Passer à Premium
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Accès illimité et fonctionnalités avancées
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-warm">
                  Découvrir Premium
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Pour bien démarrer</CardTitle>
              <CardDescription>
                Suivez ces étapes pour tirer le meilleur parti d'Oumi'School
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Ajoutez vos enfants</h4>
                    <p className="text-sm text-muted-foreground">
                      Créez un profil pour chacun de vos enfants avec leur niveau scolaire
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Explorez les ressources</h4>
                    <p className="text-sm text-muted-foreground">
                      Parcourez notre bibliothèque de leçons adaptées au programme français
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Réservez votre première session</h4>
                    <p className="text-sm text-muted-foreground">
                      Profitez de votre première session gratuite de 30 minutes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Realtime Metrics Dashboard */}
          {children.length > 0 && (
            <RealtimeDashboardMetrics studentIds={children.map(c => c.id)} />
          )}

          {/* Dashboard Content Grid */}
          {children.length > 0 && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progress Overview */}
                {children[0] && (
                  <ProgressOverview
                    studentName={children[0].prenom}
                    subjects={[
                      { subject: "Mathématiques", progress: 85, sessions: 12, grade: 16, trend: "up" },
                      { subject: "Français", progress: 70, sessions: 8, grade: 14, trend: "up" },
                      { subject: "Anglais", progress: 60, sessions: 6, grade: 13, trend: "stable" },
                      { subject: "Sciences", progress: 75, sessions: 10, grade: 15, trend: "up" },
                    ]}
                    totalSessions={totalSessions}
                    averageGrade={14.5}
                  />
                )}

                {/* Activity Feed */}
                <ActivityFeed activities={recentActivities} />
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Session Calendar */}
                <SessionCalendar
                  sessions={upcomingSessions.map(s => ({
                    id: s.id,
                    date: new Date(s.date_heure_debut),
                    time: new Date(s.date_heure_debut).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }),
                    subject: s.matiere,
                    tutor: `${s.tutors?.profiles?.prenom} ${s.tutors?.profiles?.nom}`,
                    status: s.statut,
                  }))}
                  onSessionClick={(session) => {
                    toast({
                      title: "Session sélectionnée",
                      description: `${session.subject} le ${session.date.toLocaleDateString('fr-FR')}`,
                    });
                  }}
                />
              </div>
            </div>
          )}

          {/* Upcoming Sessions & Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <UpcomingSessions />
            <RecentActivity />
          </div>

          {/* Advanced Features Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités Avancées</CardTitle>
              <CardDescription>
                Gérez votre budget, vos tuteurs favoris et votre calendrier familial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="budget" className="space-y-4">
                <TabsList className="grid w-full grid-cols-7 gap-2">
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                  <TabsTrigger value="favorites">Favoris</TabsTrigger>
                  <TabsTrigger value="calendar">Calendrier</TabsTrigger>
                  <TabsTrigger value="chat">Messages</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="analytics">Analyses</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
                </TabsList>
                <TabsContent value="budget">
                  <BudgetManagement />
                </TabsContent>
                <TabsContent value="favorites">
                  <FavoriteTutors />
                </TabsContent>
                <TabsContent value="calendar">
                  <FamilyCalendar />
                </TabsContent>
                <TabsContent value="chat">
                  <TutorChat />
                </TabsContent>
                <TabsContent value="notifications">
                  <NotificationCenter />
                </TabsContent>
                <TabsContent value="analytics">
                  <PerformanceAnalytics 
                    data={{
                      subjectPerformance: [
                        { matiere: "Mathématiques", average: 85, trend: "up", sessionsCount: 12 },
                        { matiere: "Français", average: 78, trend: "up", sessionsCount: 10 },
                        { matiere: "Anglais", average: 72, trend: "stable", sessionsCount: 8 },
                        { matiere: "Sciences", average: 88, trend: "up", sessionsCount: 11 },
                      ],
                      weeklyActivity: [
                        { week: "S1", sessions: 4, xpEarned: 120 },
                        { week: "S2", sessions: 5, xpEarned: 150 },
                        { week: "S3", sessions: 3, xpEarned: 90 },
                        { week: "S4", sessions: 6, xpEarned: 180 },
                      ],
                      quizPerformance: [
                        { date: "Lun", score: 75 },
                        { date: "Mar", score: 82 },
                        { date: "Mer", score: 78 },
                        { date: "Jeu", score: 85 },
                        { date: "Ven", score: 88 },
                      ],
                      totalStats: {
                        totalSessions: totalSessions,
                        totalXP: children[0]?.experience_points || 0,
                        averageScore: 81,
                        studyHours: Math.round(totalSessions * 1.2),
                      }
                    }}
                  />
                </TabsContent>
                <TabsContent value="recommendations">
                  <LearningRecommendations 
                    studentId={children[0]?.id || ""}
                    currentLevel={children[0]?.niveau_scolaire || "CE2"}
                    weakSubjects={["Mathématiques"]}
                    strongSubjects={["Français", "Sciences"]}
                    recentScores={[85, 78, 82, 88, 75]}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Help Button */}
      <HelpButton />
    </div>
  );
};

export default ParentDashboard;
