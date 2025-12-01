import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface RealtimeDashboardMetricsProps {
  studentIds: string[];
}

interface MetricData {
  date: string;
  sessions: number;
  quizScores: number;
  studyTime: number;
}

export const RealtimeDashboardMetrics = ({ studentIds }: RealtimeDashboardMetricsProps) => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    if (studentIds.length === 0) {
      setLoading(false);
      return;
    }

    loadMetrics();

    // Set up realtime subscriptions
    const sessionsChannel = supabase
      .channel('dashboard-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
          filter: `student_id=in.(${studentIds.join(',')})`
        },
        () => {
          loadMetrics();
        }
      )
      .subscribe();

    const quizChannel = supabase
      .channel('dashboard-quizzes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_attempts',
          filter: `student_id=in.(${studentIds.join(',')})`
        },
        () => {
          loadMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(quizChannel);
    };
  }, [studentIds]);

  const loadMetrics = async () => {
    try {
      // Get last 7 days of data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: studySessions } = await supabase
        .from("study_sessions")
        .select("*")
        .in("student_id", studentIds)
        .gte("created_at", sevenDaysAgo.toISOString());

      const { data: quizAttempts } = await supabase
        .from("quiz_attempts")
        .select("*")
        .in("student_id", studentIds)
        .gte("created_at", sevenDaysAgo.toISOString());

      // Group data by day
      const dailyMap = new Map<string, { sessions: number; quizScores: number; studyTime: number; quizCount: number }>();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
        dailyMap.set(key, { sessions: 0, quizScores: 0, studyTime: 0, quizCount: 0 });
      }

      studySessions?.forEach(session => {
        const date = new Date(session.created_at);
        const key = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
        if (dailyMap.has(key)) {
          const data = dailyMap.get(key)!;
          data.sessions += 1;
          data.studyTime += session.duration_minutes;
        }
      });

      quizAttempts?.forEach(quiz => {
        const date = new Date(quiz.created_at);
        const key = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
        if (dailyMap.has(key)) {
          const data = dailyMap.get(key)!;
          data.quizScores += quiz.percentage;
          data.quizCount += 1;
        }
      });

      const metricsData: MetricData[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        sessions: data.sessions,
        quizScores: data.quizCount > 0 ? Math.round(data.quizScores / data.quizCount) : 0,
        studyTime: data.studyTime
      }));

      setMetrics(metricsData);

      // Calculate trend
      if (metricsData.length >= 2) {
        const recent = metricsData.slice(-3).reduce((sum, d) => sum + d.sessions, 0);
        const older = metricsData.slice(0, 3).reduce((sum, d) => sum + d.sessions, 0);
        setTrend(recent > older ? 'up' : recent < older ? 'down' : 'stable');
      }
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary animate-pulse" />
                Métriques en Temps Réel
              </CardTitle>
              <CardDescription>
                Performances des 7 derniers jours • Mise à jour automatique
              </CardDescription>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
              trend === 'up' ? 'bg-success/10 text-success' : 
              trend === 'down' ? 'bg-destructive/10 text-destructive' : 
              'bg-muted text-muted-foreground'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : 
               trend === 'down' ? <TrendingDown className="h-4 w-4" /> : 
               <Activity className="h-4 w-4" />}
              <span className="text-sm font-semibold">
                {trend === 'up' ? 'En hausse' : trend === 'down' ? 'En baisse' : 'Stable'}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sessions Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Quotidienne</CardTitle>
            <CardDescription>Nombre de sessions par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="sessions" 
                  fill="hsl(var(--primary))" 
                  name="Sessions"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quiz Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance aux Quiz</CardTitle>
            <CardDescription>Score moyen quotidien (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--foreground))" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="quizScores"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  name="Score (%)"
                  dot={{ fill: 'hsl(var(--success))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Study Time Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Temps d'Étude</CardTitle>
          <CardDescription>Minutes d'étude par jour</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="studyTime" 
                fill="hsl(var(--secondary))" 
                name="Minutes d'étude"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
