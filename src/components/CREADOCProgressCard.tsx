import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, Star, TrendingUp } from "lucide-react";
import { ResourceProgress } from "@/hooks/useResourceProgress";

interface CREADOCProgressCardProps {
  studentName: string;
  progress: ResourceProgress[];
  loading?: boolean;
}

export const CREADOCProgressCard = ({
  studentName,
  progress,
  loading = false,
}: CREADOCProgressCardProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Manuels Interactifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const totalResources = progress.length;
  const completedResources = progress.filter(p => p.certificate_earned).length;
  const totalLessonsCompleted = progress.reduce((sum, p) => sum + p.completed_count, 0);
  const averageScore = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.average_score, 0) / progress.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "bg-success";
    if (percent >= 50) return "bg-warning";
    return "bg-primary";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Manuels Interactifs - {studentName}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Star className="h-3 w-3 mr-1" />
              {totalLessonsCompleted} leçons
            </Badge>
            {completedResources > 0 && (
              <Badge variant="secondary" className="bg-success/10 text-success">
                <Award className="h-3 w-3 mr-1" />
                {completedResources} certificat{completedResources > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          {progress.length > 0 && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{totalResources}</p>
                <p className="text-xs text-muted-foreground">Manuels utilisés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{completedResources}</p>
                <p className="text-xs text-muted-foreground">Terminés</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                  {averageScore}%
                </p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </div>
            </div>
          )}

          {/* Individual Resource Progress */}
          {progress.map((item, index) => {
            const progressPercent = item.total_lessons > 0
              ? Math.round((item.completed_count / item.total_lessons) * 100)
              : 0;

            return (
              <div
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm truncate max-w-[200px]">
                      {item.resource?.titre || 'Manuel interactif'}
                    </h4>
                    {item.certificate_earned && (
                      <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        Certifié
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {item.completed_count}/{item.total_lessons} leçons
                    </span>
                    <Badge variant="outline" className={`font-bold ${getScoreColor(item.average_score)}`}>
                      {Math.round(item.average_score)}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress 
                    value={progressPercent} 
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                    {progressPercent}%
                  </span>
                </div>
              </div>
            );
          })}

          {progress.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune progression disponible</p>
              <p className="text-sm text-muted-foreground mt-1">
                La progression apparaîtra quand {studentName} utilisera les manuels interactifs
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
