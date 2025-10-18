import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle2, Target } from "lucide-react";
import { motion } from "framer-motion";

interface Challenge {
  id: string;
  titre: string;
  description: string;
  objectif: number;
  type: string;
  points_recompense: number;
  icone: string;
  date_fin: string;
}

interface StudentChallenge {
  challenge_id: string;
  progression: number;
  completed: boolean;
  challenges: Challenge;
}

interface WeeklyChallengesProps {
  studentId: string;
}

export function WeeklyChallenges({ studentId }: WeeklyChallengesProps) {
  const [challenges, setChallenges] = useState<StudentChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, [studentId]);

  const fetchChallenges = async () => {
    try {
      // Get current week's challenges
      const { data: weekChallenges, error: challengesError } = await supabase
        .from("weekly_challenges")
        .select("*")
        .gte("date_fin", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (challengesError) throw challengesError;

      // Get student's progress on these challenges
      const { data: studentProgress, error: progressError } = await supabase
        .from("student_challenges")
        .select(`
          challenge_id,
          progression,
          completed,
          challenges:weekly_challenges(*)
        `)
        .eq("student_id", studentId);

      if (progressError) throw progressError;

      // Merge challenges with student progress
      const mergedChallenges = weekChallenges?.map((challenge) => {
        const progress = studentProgress?.find((p) => p.challenge_id === challenge.id);
        return {
          challenge_id: challenge.id,
          progression: progress?.progression || 0,
          completed: progress?.completed || false,
          challenges: challenge,
        };
      }) || [];

      setChallenges(mergedChallenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Défis de la semaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Défis de la semaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">Aucun défi disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <Card className="bg-gradient-to-br from-secondary/5 to-accent/5 border-secondary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-secondary" />
            Défis de la semaine
          </CardTitle>
          <Badge variant="secondary" className="bg-secondary/20 text-secondary">
            {completedCount}/{challenges.length} complétés
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {challenges.map((challenge, index) => {
            const progressPercentage = (challenge.progression / challenge.challenges.objectif) * 100;
            
            return (
              <motion.div
                key={challenge.challenge_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all ${
                  challenge.completed
                    ? "bg-success/10 border-success/30"
                    : "bg-background border-border hover:border-secondary/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`text-2xl p-2 rounded-lg ${
                      challenge.completed
                        ? "bg-success/20"
                        : "bg-secondary/10"
                    }`}
                  >
                    {challenge.challenges.icone}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          {challenge.challenges.titre}
                          {challenge.completed && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {challenge.challenges.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`flex-shrink-0 text-xs ${
                          challenge.completed
                            ? "border-success/30 text-success"
                            : "border-secondary/30 text-secondary"
                        }`}
                      >
                        +{challenge.challenges.points_recompense} pts
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-medium">
                          {challenge.progression} / {challenge.challenges.objectif}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(progressPercentage, 100)}
                        className={`h-2 ${
                          challenge.completed ? "bg-success/20" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {completedCount === challenges.length && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border-2 border-success/30 text-center"
          >
            <Trophy className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="font-semibold text-success">
              🎉 Tous les défis complétés !
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Reviens la semaine prochaine pour de nouveaux défis
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}