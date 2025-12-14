import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BookOpen, Bot, Trophy, Target, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { LevelProgress } from "@/components/LevelProgress";
import { StudyStreak } from "@/components/StudyStreak";
import { AchievementBadges } from "@/components/AchievementBadges";
import { WeeklyChallenges } from "@/components/WeeklyChallenges";
import { DailyLessons } from "@/components/DailyLessons";
import { QuickAIChat } from "@/components/QuickAIChat";
import { XPGainPopup } from "@/components/XPGainPopup";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studyDays, setStudyDays] = useState<string[]>([]);
  const [xpGain, setXpGain] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is a student
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (studentError || !studentData) {
        // Not a student, redirect to parent dashboard
        navigate("/dashboard/parent");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-accent/5 to-background">
      <NavigationHeader />
      
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
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
