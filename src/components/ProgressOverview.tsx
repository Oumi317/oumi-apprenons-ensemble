import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, BookOpen, Trophy } from "lucide-react";

interface SubjectProgress {
  subject: string;
  progress: number;
  sessions: number;
  grade: number;
  trend: "up" | "down" | "stable";
}

interface ProgressOverviewProps {
  studentName: string;
  subjects: SubjectProgress[];
  totalSessions: number;
  averageGrade: number;
}

export const ProgressOverview = ({
  studentName,
  subjects,
  totalSessions,
  averageGrade,
}: ProgressOverviewProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Progression de {studentName}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <BookOpen className="h-3 w-3 mr-1" />
              {totalSessions} sessions
            </Badge>
            <Badge variant="secondary" className="bg-success/10 text-success">
              <Trophy className="h-3 w-3 mr-1" />
              {averageGrade.toFixed(1)}/20
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {subjects.map((subject, index) => (
            <div
              key={subject.subject}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{subject.subject}</h4>
                  <span className={`text-sm ${getTrendColor(subject.trend)}`}>
                    {getTrendIcon(subject.trend)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {subject.sessions} sessions
                  </span>
                  <Badge variant="outline" className="font-bold">
                    {subject.grade}/20
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={subject.progress} className="flex-1" />
                <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                  {subject.progress}%
                </span>
              </div>
            </div>
          ))}

          {subjects.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune progression disponible</p>
              <p className="text-sm text-muted-foreground mt-1">
                Les données apparaîtront après les premières sessions
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
