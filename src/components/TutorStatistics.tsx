import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, DollarSign, Star, Calendar, Award } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Stats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  totalRevenue: number;
  averageRating: number;
  totalStudents: number;
  retentionRate: number;
}

interface SessionData {
  month: string;
  sessions: number;
  revenue: number;
  [key: string]: string | number;
}

interface SubjectData {
  subject: string;
  sessions: number;
  [key: string]: string | number;
}

export default function TutorStatistics() {
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalStudents: 0,
    retentionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<SessionData[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);

  useEffect(() => {
    fetchStatistics();
    
    // Set up realtime subscription for sessions
    const channel = supabase
      .channel('tutor-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions_tutorat'
        },
        () => {
          fetchStatistics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tutor } = await supabase
        .from("tutors")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!tutor) return;

      // Fetch all sessions
      const { data: sessions } = await supabase
        .from("sessions_tutorat")
        .select("*")
        .eq("tuteur_id", tutor.id);

      if (!sessions) {
        setLoading(false);
        return;
      }

      const completed = sessions.filter(s => s.statut === "completee");
      const upcoming = sessions.filter(s => s.statut === "programmee");
      const totalRevenue = completed.reduce((sum, s) => sum + Number(s.montant_paye || 0), 0);

      // Calculate unique students
      const uniqueStudents = new Set(sessions.map(s => s.etudiant_id));

      // Calculate retention (students with more than 1 session)
      const studentSessionCounts = sessions.reduce((acc, s) => {
        acc[s.etudiant_id] = (acc[s.etudiant_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const returningStudents = Object.values(studentSessionCounts).filter(count => count > 1).length;
      const retentionRate = uniqueStudents.size > 0 ? (returningStudents / uniqueStudents.size) * 100 : 0;

      setStats({
        totalSessions: sessions.length,
        completedSessions: completed.length,
        upcomingSessions: upcoming.length,
        totalRevenue,
        averageRating: tutor.note_moyenne,
        totalStudents: uniqueStudents.size,
        retentionRate
      });

      // Prepare monthly data for the last 6 months
      const monthlyMap = new Map<string, { sessions: number; revenue: number }>();
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        monthlyMap.set(key, { sessions: 0, revenue: 0 });
      }

      sessions.forEach(session => {
        const date = new Date(session.date_heure_debut);
        const key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        if (monthlyMap.has(key)) {
          const data = monthlyMap.get(key)!;
          data.sessions += 1;
          if (session.statut === 'completee') {
            data.revenue += Number(session.montant_paye || 0);
          }
        }
      });

      const monthlyChartData: SessionData[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        sessions: data.sessions,
        revenue: data.revenue
      }));
      setMonthlyData(monthlyChartData);

      // Prepare subject distribution data
      const subjectMap = new Map<string, number>();
      sessions.forEach(session => {
        const subject = session.matiere;
        subjectMap.set(subject, (subjectMap.get(subject) || 0) + 1);
      });

      const subjectChartData: SubjectData[] = Array.from(subjectMap.entries()).map(([subject, count]) => ({
        subject,
        sessions: count
      }));
      setSubjectData(subjectChartData);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  const statCards = [
    {
      title: "Sessions Totales",
      value: stats.totalSessions,
      icon: Calendar,
      description: `${stats.completedSessions} terminées, ${stats.upcomingSessions} à venir`
    },
    {
      title: "Revenus Totaux",
      value: `${stats.totalRevenue.toFixed(2)} €`,
      icon: DollarSign,
      description: "Depuis le début"
    },
    {
      title: "Note Moyenne",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      description: "Sur 5 étoiles"
    },
    {
      title: "Élèves Uniques",
      value: stats.totalStudents,
      icon: Users,
      description: "Nombre total d'élèves"
    },
    {
      title: "Taux de Rétention",
      value: `${stats.retentionRate.toFixed(0)}%`,
      icon: Award,
      description: "Élèves revenant pour plusieurs sessions"
    },
    {
      title: "Taux de Complétion",
      value: `${stats.totalSessions > 0 ? ((stats.completedSessions / stats.totalSessions) * 100).toFixed(0) : 0}%`,
      icon: TrendingUp,
      description: "Sessions terminées vs programmées"
    }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--muted))', 'hsl(var(--accent))'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Statistiques Détaillées</CardTitle>
          <CardDescription>
            Vue d'ensemble de votre activité de tutorat • Mise à jour en temps réel
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interactive Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Mensuelle</CardTitle>
            <CardDescription>Sessions et revenus des 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis yAxisId="left" stroke="hsl(var(--foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="sessions" fill="hsl(var(--primary))" name="Sessions" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--success))" name="Revenus (€)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Matière</CardTitle>
            <CardDescription>Distribution des sessions par matière</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ subject, percent }: any) => `${subject}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="sessions"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Revenus</CardTitle>
          <CardDescription>Tendance des revenus mensuels</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                name="Revenus (€)"
                dot={{ fill: 'hsl(var(--success))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}