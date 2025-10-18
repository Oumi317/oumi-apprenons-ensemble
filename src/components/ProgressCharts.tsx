import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Trophy, TrendingUp, Clock, Target } from "lucide-react";

interface ProgressChartsProps {
  studySessions: any[];
  achievements: any[];
  studentName?: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export function ProgressCharts({ studySessions, achievements, studentName }: ProgressChartsProps) {
  // Calculate stats
  const totalMinutes = studySessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalSessions = studySessions.length;
  const averageScore = studySessions.filter(s => s.score).reduce((sum, s) => sum + s.score, 0) / studySessions.filter(s => s.score).length || 0;
  
  // Group sessions by date for timeline
  const sessionsByDate = studySessions.reduce((acc, session) => {
    const date = new Date(session.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = { date, minutes: 0, sessions: 0 };
    }
    acc[date].minutes += session.duration_minutes;
    acc[date].sessions += 1;
    return acc;
  }, {} as Record<string, any>);
  
  const timelineData = Object.values(sessionsByDate).slice(-7); // Last 7 days

  // Group by matiere
  const byMatiere = studySessions.reduce((acc, session) => {
    if (!acc[session.matiere]) {
      acc[session.matiere] = { name: session.matiere, minutes: 0, sessions: 0 };
    }
    acc[session.matiere].minutes += session.duration_minutes;
    acc[session.matiere].sessions += 1;
    return acc;
  }, {} as Record<string, any>);
  
  const matiereData = Object.values(byMatiere);

  // Recent achievements
  const recentAchievements = achievements.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(totalMinutes / 60)}h</p>
                <p className="text-sm text-muted-foreground">Temps total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSessions}</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(averageScore)}%</p>
                <p className="text-sm text-muted-foreground">Score moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{achievements.length}</p>
                <p className="text-sm text-muted-foreground">Succès</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Activité des 7 derniers jours</CardTitle>
            <CardDescription>Temps d'étude quotidien</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Minutes"
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subjects Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par matière</CardTitle>
            <CardDescription>Temps passé par matière</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={matiereData as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="minutes"
                >
                  {(matiereData as any[]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions by Subject */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions par matière</CardTitle>
            <CardDescription>Nombre de sessions complétées</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={matiereData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="sessions" fill="hsl(var(--secondary))" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Succès récents</CardTitle>
            <CardDescription>Derniers accomplissements</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAchievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Aucun succès débloqué pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
                  >
                    <div className="text-3xl">{achievement.icon || '🏆'}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          +{achievement.points} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(achievement.unlocked_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
