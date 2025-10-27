import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video,
  ChevronLeft,
  ChevronRight 
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Session {
  id: string;
  date: Date;
  time: string;
  subject: string;
  tutor: string;
  status: "programmee" | "en_cours" | "terminee";
}

interface SessionCalendarProps {
  sessions: Session[];
  onSessionClick?: (session: Session) => void;
}

export const SessionCalendar = ({ sessions, onSessionClick }: SessionCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"calendar" | "list">("list");

  const sessionsForSelectedDate = sessions.filter((session) => {
    if (!selectedDate) return false;
    return format(session.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
  });

  const upcomingSessions = sessions
    .filter((s) => s.status === "programmee" && s.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "programmee":
        return "bg-primary/10 text-primary border-primary/20";
      case "en_cours":
        return "bg-success/10 text-success border-success/20";
      case "terminee":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "programmee":
        return "Programmée";
      case "en_cours":
        return "En cours";
      case "terminee":
        return "Terminée";
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <CardTitle>Sessions à venir</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
            >
              Liste
            </Button>
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              Calendrier
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "calendar" ? (
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
              locale={fr}
            />
            {sessionsForSelectedDate.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">
                  Sessions pour le {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: fr })}
                </h4>
                {sessionsForSelectedDate.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-colors cursor-pointer"
                    onClick={() => onSessionClick?.(session)}
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{session.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.time} • {session.tutor}
                      </p>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusLabel(session.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune session prévue pour cette date
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary transition-all hover:shadow-md cursor-pointer group"
                  onClick={() => onSessionClick?.(session)}
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{session.subject}</p>
                      <Badge className={getStatusColor(session.status)} variant="outline">
                        {getStatusLabel(session.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {session.tutor}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(session.date, "d MMM yyyy", { locale: fr })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.time}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    Rejoindre
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Aucune session à venir</p>
                <Button className="mt-4" size="sm">
                  Réserver une session
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
