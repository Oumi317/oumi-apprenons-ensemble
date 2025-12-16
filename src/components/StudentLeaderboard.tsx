import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, Crown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  id: string;
  prenom: string;
  niveau_scolaire: string;
  niveau: number;
  experience_points: number;
}

interface StudentLeaderboardProps {
  studentId: string;
  niveauScolaire: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
    case 2:
      return "bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-400/30";
    case 3:
      return "bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-600/30";
    default:
      return "bg-card border-border";
  }
};

export function StudentLeaderboard({ studentId, niveauScolaire }: StudentLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRank, setCurrentRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [niveauScolaire]);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, prenom, niveau_scolaire, niveau, experience_points")
        .eq("niveau_scolaire", niveauScolaire as any)
        .order("experience_points", { ascending: false })
        .limit(10);

      if (error) throw error;

      setLeaderboard(data || []);

      // Find current student's rank
      const rank = data?.findIndex(s => s.id === studentId);
      if (rank !== undefined && rank !== -1) {
        setCurrentRank(rank + 1);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Classement {niveauScolaire}
          </CardTitle>
          {currentRank && (
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Tu es #{currentRank}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Aucun élève dans ce niveau</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentStudent = entry.id === studentId;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${getRankStyle(rank)} ${
                    isCurrentStudent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {getRankIcon(rank)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentStudent ? "text-primary" : ""}`}>
                      {entry.prenom}
                      {isCurrentStudent && " (Toi)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Niveau {entry.niveau}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary">{entry.experience_points.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}