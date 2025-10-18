import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface Session {
  id: string;
  date_heure_debut: string;
  duree_minutes: number;
  matiere: string;
  statut: string;
  lien_zoom?: string;
  students: {
    prenom: string;
  };
  tutors: {
    user_id: string;
    profiles: {
      prenom: string;
      nom: string;
    };
  };
}

export function UpcomingSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
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
        .from("sessions_tutorat")
        .select(`
          id,
          date_heure_debut,
          duree_minutes,
          matiere,
          statut,
          lien_zoom,
          students (prenom),
          tutors (
            user_id,
            profiles:user_id (prenom, nom)
          )
        `)
        .in("etudiant_id", studentIds)
        .eq("statut", "programmee")
        .gte("date_heure_debut", new Date().toISOString())
        .order("date_heure_debut", { ascending: true })
        .limit(3);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sessions à venir</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sessions à venir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune session programmée</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions à venir</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge>{session.matiere}</Badge>
                  <span className="text-sm font-medium">{session.students.prenom}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(session.date_heure_debut), "dd MMM yyyy", { locale: fr })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(session.date_heure_debut), "HH:mm", { locale: fr })}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {session.tutors.profiles.prenom} {session.tutors.profiles.nom}
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate(`/video-session/${session.id}`)}
              >
                <Video className="h-4 w-4 mr-2" />
                Rejoindre
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
