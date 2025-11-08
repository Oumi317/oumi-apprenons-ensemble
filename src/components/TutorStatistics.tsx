import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, DollarSign, Star, Calendar, Award } from "lucide-react";

interface Stats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  totalRevenue: number;
  averageRating: number;
  totalStudents: number;
  retentionRate: number;
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

  useEffect(() => {
    fetchStatistics();
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Statistiques Détaillées</CardTitle>
          <CardDescription>
            Vue d'ensemble de votre activité de tutorat
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
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
    </div>
  );
}