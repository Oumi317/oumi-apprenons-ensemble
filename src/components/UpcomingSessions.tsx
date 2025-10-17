import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, User } from "lucide-react";

interface Session {
  id: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  studentName: string;
}

interface UpcomingSessionsProps {
  sessions?: Session[];
}

export function UpcomingSessions({ sessions = [] }: UpcomingSessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prochaines sessions</CardTitle>
          <CardDescription>Aucune session programmée</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Vous n'avez pas encore de sessions programmées
            </p>
            <Button variant="outline" size="sm">
              Réserver une session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prochaines sessions</CardTitle>
        <CardDescription>
          {sessions.length} session{sessions.length > 1 ? "s" : ""} à venir
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-4 border rounded-lg hover:border-primary transition-colors space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{session.subject}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <User className="h-3 w-3" />
                  {session.tutorName} • {session.studentName}
                </p>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">
                Confirmée
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{session.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{session.time} ({session.duration}min)</span>
              </div>
            </div>

            <Button size="sm" className="w-full bg-gradient-primary">
              <Video className="h-4 w-4 mr-2" />
              Rejoindre la session
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
