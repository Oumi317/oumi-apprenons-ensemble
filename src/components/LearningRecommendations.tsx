import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  TrendingUp, 
  Target, 
  Lightbulb,
  ArrowRight,
  Star,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

interface Recommendation {
  id: string;
  type: "lesson" | "revision" | "challenge" | "tutor";
  title: string;
  description: string;
  reason: string;
  subject: string;
  difficulty: "facile" | "moyen" | "difficile";
  estimatedTime: number;
  priority: "high" | "medium" | "low";
  link?: string;
}

interface LearningPath {
  current: string;
  completed: number;
  total: number;
  nextMilestone: string;
  progress: number;
}

interface LearningRecommendationsProps {
  studentId: string;
  currentLevel: string;
  weakSubjects: string[];
  strongSubjects: string[];
  recentScores: number[];
}

export function LearningRecommendations({
  studentId,
  currentLevel,
  weakSubjects,
  strongSubjects,
  recentScores,
}: LearningRecommendationsProps) {
  // Generate recommendations based on student data
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Add recommendations for weak subjects
    weakSubjects.forEach((subject, index) => {
      recommendations.push({
        id: `weak-${index}`,
        type: "revision",
        title: `Réviser ${subject}`,
        description: `Des exercices ciblés pour améliorer tes résultats en ${subject}`,
        reason: "Tu as eu des difficultés récentes dans cette matière",
        subject,
        difficulty: "moyen",
        estimatedTime: 30,
        priority: "high",
        link: `/lessons?subject=${subject}`,
      });
    });

    // Add advanced lessons for strong subjects
    if (strongSubjects.length > 0) {
      const strongSubject = strongSubjects[0];
      recommendations.push({
        id: "strong-1",
        type: "challenge",
        title: `Défis avancés en ${strongSubject}`,
        description: `Relève le défi et approfondit tes connaissances`,
        reason: "Tu excelles dans cette matière !",
        subject: strongSubject,
        difficulty: "difficile",
        estimatedTime: 45,
        priority: "medium",
        link: `/lessons?subject=${strongSubject}&difficulty=advanced`,
      });
    }

    // Add new lesson recommendation
    recommendations.push({
      id: "new-1",
      type: "lesson",
      title: "Nouvelle leçon recommandée",
      description: "Continue ta progression avec cette nouvelle leçon adaptée à ton niveau",
      reason: "Basé sur tes progrès récents",
      subject: "Mathématiques",
      difficulty: "moyen",
      estimatedTime: 25,
      priority: "medium",
      link: "/lessons",
    });

    // Add tutor recommendation if scores are declining
    const avgScore = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;
    if (avgScore < 60) {
      recommendations.push({
        id: "tutor-1",
        type: "tutor",
        title: "Session avec un tuteur",
        description: "Un tuteur peut t'aider à surmonter tes difficultés",
        reason: "Tes scores récents suggèrent qu'un accompagnement serait utile",
        subject: weakSubjects[0] || "Général",
        difficulty: "moyen",
        estimatedTime: 60,
        priority: "high",
        link: "/tutors",
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const recommendations = generateRecommendations();

  const learningPath: LearningPath = {
    current: currentLevel,
    completed: 12,
    total: 20,
    nextMilestone: "Maîtrise des fractions",
    progress: 60,
  };

  const difficultyColors = {
    facile: "bg-green-500/10 text-green-500 border-green-500/20",
    moyen: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    difficile: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const priorityColors = {
    high: "border-red-500/50",
    medium: "border-yellow-500/50",
    low: "border-gray-500/50",
  };

  const typeIcons = {
    lesson: BookOpen,
    revision: TrendingUp,
    challenge: Target,
    tutor: Star,
  };

  return (
    <div className="space-y-6">
      {/* Learning Path */}
      <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Ton parcours d'apprentissage
          </CardTitle>
          <CardDescription>
            Continue à progresser vers ton prochain objectif
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression vers le prochain niveau</span>
              <span className="font-medium">{learningPath.completed} / {learningPath.total} leçons</span>
            </div>
            <Progress value={learningPath.progress} className="h-3" />
          </div>

          <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-sm">Prochain jalon</p>
              <p className="text-sm text-muted-foreground">{learningPath.nextMilestone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Recommandations personnalisées
          </CardTitle>
          <CardDescription>
            Leçons et activités adaptées à ton profil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec) => {
            const Icon = typeIcons[rec.type];
            
            return (
              <Card
                key={rec.id}
                className={`border-2 transition-all hover:shadow-md ${priorityColors[rec.priority]}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold">{rec.title}</h4>
                          {rec.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">
                              Prioritaire
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rec.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Lightbulb className="h-3 w-3" />
                          <span>{rec.reason}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            {rec.subject}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${difficultyColors[rec.difficulty]}`}>
                            {rec.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{rec.estimatedTime} min</span>
                          </div>
                        </div>

                        {rec.link && (
                          <Link to={rec.link}>
                            <Button size="sm" variant="default">
                              Commencer
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {recommendations.length === 0 && (
            <div className="text-center py-12">
              <Lightbulb className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">
                Continue à étudier pour recevoir des recommandations personnalisées
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Tips */}
      <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-secondary" />
            Conseils d'apprentissage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-secondary mt-2" />
            <p className="text-sm">
              Étudie régulièrement pendant 25-30 minutes, puis fais une pause de 5 minutes
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-secondary mt-2" />
            <p className="text-sm">
              Révise les matières difficiles le matin quand tu es le plus concentré
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-secondary mt-2" />
            <p className="text-sm">
              N'hésite pas à poser des questions à ton tuteur ou utiliser l'assistant IA
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
