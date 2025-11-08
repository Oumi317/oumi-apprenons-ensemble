import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

interface SessionEvent {
  id: string;
  date_heure_debut: string;
  duree_minutes: number;
  matiere: string;
  student: {
    prenom: string;
  };
  tutor: {
    profiles: {
      prenom: string;
      nom: string;
    } | null;
  };
}

export default function FamilyCalendar() {
  const [sessions, setSessions] = useState<SessionEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

      const { data, error } = await supabase
        .from("sessions_tutorat")
        .select(`
          id,
          date_heure_debut,
          duree_minutes,
          matiere,
          students:etudiant_id (
            prenom
          ),
          tutors:tuteur_id (
            profiles:user_id (
              prenom,
              nom
            )
          )
        `)
        .in("etudiant_id", students.map(s => s.id))
        .eq("statut", "programmee")
        .gte("date_heure_debut", new Date().toISOString())
        .order("date_heure_debut", { ascending: true });

      if (error) throw error;
      setSessions(data as any || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDatesWithSessions = () => {
    return sessions.map(s => new Date(s.date_heure_debut));
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(s => isSameDay(new Date(s.date_heure_debut), date));
  };

  const exportToICalendar = () => {
    let ical = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Oumi'School//Calendar//FR\n";

    sessions.forEach(session => {
      const start = new Date(session.date_heure_debut);
      const end = new Date(start.getTime() + session.duree_minutes * 60000);
      
      ical += "BEGIN:VEVENT\n";
      ical += `DTSTART:${format(start, "yyyyMMdd'T'HHmmss")}\n`;
      ical += `DTEND:${format(end, "yyyyMMdd'T'HHmmss")}\n`;
      ical += `SUMMARY:${session.matiere} - ${session.student.prenom}\n`;
      ical += `DESCRIPTION:Session avec ${session.tutor.profiles?.prenom || 'Tuteur'} ${session.tutor.profiles?.nom || ''}\n`;
      ical += "END:VEVENT\n";
    });

    ical += "END:VCALENDAR";

    const blob = new Blob([ical], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "oumi-school-calendar.ics";
    link.click();

    toast({
      title: "Calendrier exporté",
      description: "Le fichier .ics a été téléchargé"
    });
  };

  const selectedDateSessions = selectedDate ? getSessionsForDate(selectedDate) : [];

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendrier Familial
            </CardTitle>
            <CardDescription>
              Toutes les sessions de vos enfants en un coup d'œil
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportToICalendar}>
            <Download className="h-4 w-4 mr-2" />
            Exporter (.ics)
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={fr}
          modifiers={{
            booked: getDatesWithSessions()
          }}
          modifiersStyles={{
            booked: {
              fontWeight: "bold",
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))"
            }
          }}
          className="rounded-md border"
        />

        {selectedDate && selectedDateSessions.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">
              Sessions du {format(selectedDate, "d MMMM yyyy", { locale: fr })}
            </h3>
            {selectedDateSessions.map(session => (
              <div key={session.id} className="p-3 border rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{session.matiere}</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(session.date_heure_debut), "HH:mm", { locale: fr })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {session.student.prenom} avec {session.tutor.profiles?.prenom || 'Tuteur'}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}