import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BookOpen, Bot, Trophy, Target, Flame, Users, LogOut, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { LevelProgress } from "@/components/LevelProgress";
import { StudyStreak } from "@/components/StudyStreak";
import { AchievementBadges } from "@/components/AchievementBadges";
import { WeeklyChallenges } from "@/components/WeeklyChallenges";
import { DailyLessons } from "@/components/DailyLessons";
import { QuickAIChat } from "@/components/QuickAIChat";
import { XPGainPopup } from "@/components/XPGainPopup";
import { StudentLeaderboard } from "@/components/StudentLeaderboard";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { childSession, endChildSession, isChildMode, timeRemaining } = useChildSession();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studyDays, setStudyDays] = useState<string[]>([]);
  const [xpGain, setXpGain] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false });

  useEffect(() => {
    // Si pas de session enfant active, rediriger
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
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievements',
          filter: `student_id=eq.${student.id}`
        },
        (payload) => {
          const newAchievement = payload.new as Achievement;
          setAchievements(prev => [newAchievement, ...prev]);
          // Trigger XP gain popup for the achievement
          handleXPGain(newAchievement.points);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [student?.id]);

  // Realtime subscription for XP updates
  useEffect(() => {
    if (!student) return;

    const channel = supabase
      .channel('student-xp')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'students',
          filter: `id=eq.${student.id}`
        },
        (payload) => {
          const updatedStudent = payload.new as Student;
          if (updatedStudent.experience_points > student.experience_points) {
            const xpDiff = updatedStudent.experience_points - student.experience_points;
            setXpGain({ amount: xpDiff, show: true });
          }
          setStudent(updatedStudent);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [student?.id, student?.experience_points]);

  const loadStudentData = async (studentId: string) => {
    try {
      // Load student data using the session studentId
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, parent_id, user_id, prenom, date_naissance, niveau_scolaire, besoins_specifiques, objectifs_apprentissage, niveau, experience_points, current_streak, longest_streak, created_at, updated_at")
        .eq("id", studentId)
        .single();

      if (studentError || !studentData) {
        console.error("Student not found:", studentError);
        endChildSession();
        navigate("/child-profiles");
        return;
      }

      setStudent(studentData);

      // Load achievements
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*")
        .eq("student_id", studentData.id)
        .order("unlocked_at", { ascending: false });

      if (achievementsData) {
        setAchievements(achievementsData);
      }

      // Load study days for streak calendar
      const { data: studySessions } = await supabase
        .from("study_sessions")
        .select("created_at")
        .eq("student_id", studentData.id)
        .eq("completed", true)
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (studySessions) {
        const days = studySessions.map(s => 
          new Date(s.created_at).toISOString().split("T")[0]
        );
        setStudyDays([...new Set(days)]);
      }

    } catch (error) {
      console.error("Error loading student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleXPGain = (amount: number) => {
    setXpGain({ amount, show: true });
    // Update local student state
    if (student) {
      setStudent({
        ...student,
        experience_points: student.experience_points + amount
      });
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

  if (!student || !isChildMode) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-accent/5 to-background">
      {/* Barre de session enfant */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExitChildMode}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Quitter
            </Button>
          </div>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Bonjour {student.prenom} ! 👋
          </h1>
          <p className="text-muted-foreground">
            Prêt pour une nouvelle journée d'apprentissage ?
          </p>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{student.niveau}</p>
                <p className="text-xs text-muted-foreground">Niveau</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{student.experience_points}</p>
                <p className="text-xs text-muted-foreground">XP Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{student.current_streak}</p>
                <p className="text-xs text-muted-foreground">Jours de suite</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <BookOpen className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{achievements.length}</p>
                <p className="text-xs text-muted-foreground">Succès</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="apprendre" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="apprendre" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Apprendre</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Assistant IA</span>
            </TabsTrigger>
            <TabsTrigger value="defis" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Défis</span>
            </TabsTrigger>
            <TabsTrigger value="classement" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Classement</span>
            </TabsTrigger>
            <TabsTrigger value="succes" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Succès</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apprendre" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <DailyLessons 
                  studentId={student.id} 
                  niveauScolaire={student.niveau_scolaire}
                  onXPGain={handleXPGain}
                  isChildMode={true}
                />
              </div>
              <div className="space-y-6">
                <LevelProgress 
                  level={student.niveau} 
                  experience={student.experience_points}
                  studentName={student.prenom}
                />
                <StudyStreak 
                  currentStreak={student.current_streak}
                  longestStreak={student.longest_streak}
                  studyDays={studyDays}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assistant">
            <QuickAIChat studentId={student.id} studentName={student.prenom} />
          </TabsContent>

          <TabsContent value="defis">
            <WeeklyChallenges studentId={student.id} />
          </TabsContent>

          <TabsContent value="classement">
            <StudentLeaderboard 
              studentId={student.id} 
              niveauScolaire={student.niveau_scolaire} 
            />
          </TabsContent>

          <TabsContent value="succes">
            <AchievementBadges achievements={achievements} />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* XP Gain Popup */}
      <XPGainPopup 
        amount={xpGain.amount} 
        show={xpGain.show} 
        onComplete={() => setXpGain({ ...xpGain, show: false })}
      />
    </div>
  );
}
