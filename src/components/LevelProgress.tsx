import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface LevelProgressProps {
  level: number;
  experience: number;
  studentName: string;
}

export function LevelProgress({ level, experience, studentName }: LevelProgressProps) {
  // Calculate XP needed for next level: level^2 * 100
  const xpForCurrentLevel = (level - 1) * (level - 1) * 100;
  const xpForNextLevel = level * level * 100;
  const xpInCurrentLevel = experience - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-primary fill-primary" />
            <span>Niveau de {studentName}</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full border-2 border-primary/30"
          >
            <Zap className="h-5 w-5 text-primary fill-primary" />
            <span className="text-2xl font-bold text-primary">{level}</span>
          </motion.div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expérience</span>
            <span className="font-medium">
              {xpInCurrentLevel} / {xpNeededForNextLevel} XP
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 bg-background/50 rounded-lg border border-primary/10">
            <div className="text-2xl font-bold text-primary">{experience}</div>
            <div className="text-xs text-muted-foreground mt-1">XP Total</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg border border-secondary/10">
            <div className="text-2xl font-bold text-secondary">
              {xpNeededForNextLevel - xpInCurrentLevel}
            </div>
            <div className="text-xs text-muted-foreground mt-1">XP restants</div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-2">
          Prochain niveau : <span className="font-semibold text-primary">Niveau {level + 1}</span>
        </div>
      </CardContent>
    </Card>
  );
}