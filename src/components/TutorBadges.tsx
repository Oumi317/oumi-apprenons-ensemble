import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, Zap, Users, Award, Clock, ThumbsUp, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TutorBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  earned: boolean;
  progress?: number;
  requirement?: string;
}

interface TutorBadgesProps {
  tutorId: string;
  compact?: boolean;
}

export function TutorBadges({ tutorId, compact = false }: TutorBadgesProps) {
  const [badges, setBadges] = useState<TutorBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateBadges();
  }, [tutorId]);

  const calculateBadges = async () => {
    try {
      // Fetch tutor data
      const { data: tutor } = await supabase
        .from("tutors")
        .select("*")
        .eq("id", tutorId)
        .single();

      if (!tutor) return;

      // Fetch sessions
      const { data: sessions } = await supabase
        .from("sessions_tutorat")
        .select("*")
        .eq("tuteur_id", tutorId);

      const completedSessions = sessions?.filter(s => s.statut === "completee") || [];
      const ratedSessions = completedSessions.filter(s => s.evaluation_etudiant);
      const avgRating = ratedSessions.length > 0 
        ? ratedSessions.reduce((acc, s) => acc + (s.evaluation_etudiant || 0), 0) / ratedSessions.length 
        : 0;

      // Fetch feedback
      const { data: feedback } = await supabase
        .from("session_feedback")
        .select("*")
        .eq("tutor_id", tutorId);

      const avgComprehension = feedback?.length 
        ? feedback.reduce((acc, f) => acc + (f.comprehension_score || 0), 0) / feedback.length 
        : 0;

      // Calculate unique students
      const uniqueStudents = new Set(completedSessions.map(s => s.etudiant_id)).size;

      // Calculate response time (placeholder - would need messaging data)
      const responseRate = 95; // Mock value

      // Define badges
      const badgeDefinitions: TutorBadge[] = [
        {
          id: "expert",
          name: "Expert",
          description: "Plus de 50 sessions complétées avec excellence",
          icon: <Star className="h-4 w-4" />,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10 border-yellow-500/30",
          earned: completedSessions.length >= 50 && avgRating >= 4.5,
          progress: Math.min(100, (completedSessions.length / 50) * 100),
          requirement: `${completedSessions.length}/50 sessions • Note ≥4.5`,
        },
        {
          id: "reactif",
          name: "Réactif",
          description: "Répond rapidement aux messages (moins de 2h)",
          icon: <Zap className="h-4 w-4" />,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10 border-blue-500/30",
          earned: responseRate >= 90,
          progress: responseRate,
          requirement: `${responseRate}% de réponses rapides`,
        },
        {
          id: "populaire",
          name: "Populaire",
          description: "Plus de 20 élèves différents ont suivi des cours",
          icon: <Users className="h-4 w-4" />,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10 border-purple-500/30",
          earned: uniqueStudents >= 20,
          progress: Math.min(100, (uniqueStudents / 20) * 100),
          requirement: `${uniqueStudents}/20 élèves différents`,
        },
        {
          id: "pedagogue",
          name: "Pédagogue",
          description: "Excellente compréhension moyenne des élèves",
          icon: <Target className="h-4 w-4" />,
          color: "text-green-500",
          bgColor: "bg-green-500/10 border-green-500/30",
          earned: avgComprehension >= 4.5 && feedback && feedback.length >= 10,
          progress: Math.min(100, (avgComprehension / 5) * 100),
          requirement: `Score de compréhension: ${avgComprehension.toFixed(1)}/5`,
        },
        {
          id: "assidu",
          name: "Assidu",
          description: "Plus de 100 heures de cours dispensées",
          icon: <Clock className="h-4 w-4" />,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10 border-orange-500/30",
          earned: (completedSessions.reduce((acc, s) => acc + s.duree_minutes, 0) / 60) >= 100,
          progress: Math.min(100, (completedSessions.reduce((acc, s) => acc + s.duree_minutes, 0) / 60 / 100) * 100),
          requirement: `${(completedSessions.reduce((acc, s) => acc + s.duree_minutes, 0) / 60).toFixed(0)}/100 heures`,
        },
        {
          id: "bien_note",
          name: "Bien noté",
          description: "Note moyenne supérieure à 4.5/5",
          icon: <ThumbsUp className="h-4 w-4" />,
          color: "text-pink-500",
          bgColor: "bg-pink-500/10 border-pink-500/30",
          earned: avgRating >= 4.5 && ratedSessions.length >= 10,
          progress: Math.min(100, (avgRating / 5) * 100),
          requirement: `Note: ${avgRating.toFixed(1)}/5 (${ratedSessions.length} avis)`,
        },
        {
          id: "certifie",
          name: "Certifié",
          description: "Profil vérifié et certifications validées",
          icon: <Award className="h-4 w-4" />,
          color: "text-indigo-500",
          bgColor: "bg-indigo-500/10 border-indigo-500/30",
          earned: tutor.verification_casier && tutor.certifications && tutor.certifications.length > 0,
          requirement: "Vérifications complètes",
        },
        {
          id: "nouveau_talent",
          name: "Nouveau talent",
          description: "Tuteur prometteur avec d'excellents débuts",
          icon: <Sparkles className="h-4 w-4" />,
          color: "text-teal-500",
          bgColor: "bg-teal-500/10 border-teal-500/30",
          earned: completedSessions.length >= 5 && completedSessions.length < 20 && avgRating >= 4.0,
          requirement: "Premiers pas réussis",
        },
      ];

      setBadges(badgeDefinitions);
    } catch (error) {
      console.error("Error calculating badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadges = badges.filter(b => b.earned);
  const displayBadges = compact ? earnedBadges.slice(0, 3) : badges;

  if (loading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-6 w-20 bg-muted animate-pulse rounded-full" />
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          {earnedBadges.length === 0 ? (
            <span className="text-xs text-muted-foreground">Pas encore de badges</span>
          ) : (
            earnedBadges.map((badge, index) => (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge 
                      variant="outline" 
                      className={`${badge.bgColor} ${badge.color} cursor-help`}
                    >
                      {badge.icon}
                      <span className="ml-1">{badge.name}</span>
                    </Badge>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </TooltipContent>
              </Tooltip>
            ))
          )}
          {earnedBadges.length > 3 && (
            <Badge variant="outline" className="bg-muted">
              +{earnedBadges.length - 3}
            </Badge>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative p-4 rounded-lg border-2 ${
              badge.earned 
                ? badge.bgColor 
                : "bg-muted/30 border-muted opacity-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={badge.earned ? badge.color : "text-muted-foreground"}>
                {badge.icon}
              </div>
              <span className={`font-medium text-sm ${badge.earned ? "" : "text-muted-foreground"}`}>
                {badge.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
            
            {badge.progress !== undefined && (
              <div className="mt-2">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${badge.progress}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      badge.earned ? "bg-current" : "bg-muted-foreground/50"
                    } ${badge.color}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{badge.requirement}</p>
              </div>
            )}

            {badge.earned && (
              <div className="absolute top-2 right-2">
                <div className={`h-2 w-2 rounded-full ${badge.color.replace("text-", "bg-")} animate-pulse`} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </TooltipProvider>
  );
}
