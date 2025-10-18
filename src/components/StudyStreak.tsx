import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StudyStreakProps {
  currentStreak: number;
  longestStreak: number;
  studyDays: string[];
}

export function StudyStreak({ currentStreak, longestStreak, studyDays }: StudyStreakProps) {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const isStudyDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return studyDays.some(day => day.startsWith(dateStr));
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          Série d'étude
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-primary flex items-center gap-2">
                <Flame className="h-8 w-8" />
                {currentStreak}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Jours consécutifs</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-muted-foreground">
                {longestStreak}
              </div>
              <p className="text-xs text-muted-foreground">Record</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">7 derniers jours</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {last7Days.map((date, index) => {
                const hasStudied = isStudyDay(date);
                const isToday = date.toDateString() === today.toDateString();
                
                return (
                  <div key={index} className="text-center">
                    <div
                      className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                        hasStudied
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground'
                      } ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {currentStreak >= 3 && (
            <Badge className="w-full justify-center bg-primary/20 text-primary border-primary/30">
              Continue ! Tu es sur une excellente lancée 🔥
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
