import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Activity {
  id: string;
  date_debut: string;
  statut_completion: number;
  temps_passe_minutes: number;
  students: {
    prenom: string;
  };
  lessons: {
    titre: string;
    matiere: string;
  };
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: students } = await supabase
        .from("students")
        .select("id")
        .eq("parent_id", user.id);

      if (!students || students.length === 0) {
        setLoading(false);
        return;
      }

      const studentIds = students.map(s => s.id);

      const { data, error } = await supabase
        .from("student_progress")
        .select(`
          id,
          date_debut,
          statut_completion,
          temps_passe_minutes,
          students (prenom),
          lessons (titre, matiere)
        `)
        .in("etudiant_id", studentIds)
        .order("date_debut", { ascending: false })
        .limit(5);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune activité récente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-3 border rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.students.prenom}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.lessons.titre}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {activity.lessons.matiere}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.temps_passe_minutes || 0} min
                  </div>
                  <span>
                    {formatDistanceToNow(new Date(activity.date_debut), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{activity.statut_completion}%</p>
                <p className="text-xs text-muted-foreground">Complété</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
