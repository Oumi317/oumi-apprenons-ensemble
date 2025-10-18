import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Flame, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked_at: string;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
}

const getIcon = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    "🎯": <Target className="h-6 w-6" />,
    "🏆": <Trophy className="h-6 w-6" />,
    "⭐": <Star className="h-6 w-6" />,
    "🔥": <Flame className="h-6 w-6" />,
    "🎖️": <Award className="h-6 w-6" />,
    "⚡": <Zap className="h-6 w-6" />,
  };
  return icons[iconName] || <Star className="h-6 w-6" />;
};

export function AchievementBadges({ achievements }: AchievementBadgesProps) {
  const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Succès débloqués
          </CardTitle>
          <Badge variant="secondary" className="bg-accent/20 text-accent">
            {totalPoints} points
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Aucun succès débloqué pour le moment</p>
            <p className="text-sm mt-1">Continue à étudier pour débloquer des succès !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-background border border-accent/20 hover:border-accent/40 transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    {getIcon(achievement.icon)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                        +{achievement.points} pts
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.unlocked_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
