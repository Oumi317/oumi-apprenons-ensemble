import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Flame, Award, Zap, BookOpen, Brain, Compass, Crown } from "lucide-react";
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
    "📖": <BookOpen className="h-6 w-6" />,
    "🧠": <Brain className="h-6 w-6" />,
    "🗺️": <Compass className="h-6 w-6" />,
    "👑": <Crown className="h-6 w-6" />,
    "💯": <span className="text-lg font-bold">💯</span>,
    "💪": <span className="text-lg">💪</span>,
    "🎨": <span className="text-lg">🎨</span>,
  };
  return icons[iconName] || <Star className="h-6 w-6" />;
};

const getTypeColor = (type: string) => {
  const colors: { [key: string]: string } = {
    milestone: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    streak: "from-orange-500/20 to-red-500/20 border-orange-500/30",
    perfect_quiz: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    level_up: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  };
  return colors[type] || "from-accent/10 to-accent/20 border-accent/30";
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
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`relative p-4 rounded-xl bg-gradient-to-br ${getTypeColor(achievement.type)} border overflow-hidden transition-shadow hover:shadow-lg`}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                  animate={{ translateX: ["100%", "-100%"] }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatDelay: 3,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
                
                <div className="relative flex items-start gap-3">
                  <motion.div 
                    className="p-2.5 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {getIcon(achievement.icon)}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 truncate">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs bg-background/50">
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
