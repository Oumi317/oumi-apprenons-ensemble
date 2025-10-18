import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, BookOpen, Trophy, Clock } from "lucide-react";
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

interface PerformanceData {
  subjectPerformance: Array<{
    matiere: string;
    average: number;
    trend: "up" | "down" | "stable";
    sessionsCount: number;
  }>;
  weeklyActivity: Array<{
    week: string;
    sessions: number;
    xpEarned: number;
  }>;
  quizPerformance: Array<{
    date: string;
    score: number;
  }>;
  totalStats: {
    totalSessions: number;
    totalXP: number;
    averageScore: number;
    studyHours: number;
  };
}

interface PerformanceAnalyticsProps {
  data: PerformanceData;
}

export function PerformanceAnalytics({ data }: PerformanceAnalyticsProps) {
  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Target className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "bg-green-500/10 text-green-500 border-green-500/20";
    if (trend === "down") return "bg-red-500/10 text-red-500 border-red-500/20";
    return "bg-muted text-muted-foreground border-muted";
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessions totales</p>
                <p className="text-2xl font-bold">{data.totalStats.totalSessions}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">XP Total</p>
                <p className="text-2xl font-bold">{data.totalStats.totalXP}</p>
              </div>
              <Trophy className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score moyen</p>
                <p className="text-2xl font-bold">{data.totalStats.averageScore}%</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heures d'étude</p>
                <p className="text-2xl font-bold">{data.totalStats.studyHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Subject */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par matière</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.subjectPerformance.map((subject) => (
              <div key={subject.matiere} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{subject.matiere}</span>
                    <Badge variant="outline" className={getTrendColor(subject.trend)}>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(subject.trend)}
                        <span className="text-xs">{subject.average}%</span>
                      </div>
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {subject.sessionsCount} sessions
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${subject.average}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activité hebdomadaire</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Sessions" radius={[8, 8, 0, 0]} />
              <Bar dataKey="xpEarned" fill="hsl(var(--secondary))" name="XP gagné" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quiz Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des scores aux quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.quizPerformance}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
                name="Score (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
