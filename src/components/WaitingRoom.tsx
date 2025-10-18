import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface WaitingRoomProps {
  sessionId: string;
  sessionDate: string;
  matiere: string;
  tutorName?: string;
  onJoin: () => void;
}

export default function WaitingRoom({
  sessionId,
  sessionDate,
  matiere,
  tutorName,
  onJoin,
}: WaitingRoomProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [timeUntilStart, setTimeUntilStart] = useState("");
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const sessionTime = new Date(sessionDate);
      const diff = sessionTime.getTime() - now.getTime();

      if (diff <= 0) {
        setCanJoin(true);
        setTimeUntilStart("La session peut commencer");
      } else if (diff <= 5 * 60 * 1000) {
        // 5 minutes avant
        setCanJoin(true);
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeUntilStart(`Début dans ${minutes}m ${seconds}s`);
      } else {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setTimeUntilStart(`Début dans ${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionDate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Video Preview */}
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-muted flex items-center justify-center relative">
              <div className="text-center">
                {isVideoOn ? (
                  <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                ) : (
                  <VideoOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                )}
                <p className="text-lg font-medium">Prévisualisation de votre caméra</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vérifiez votre apparence avant de rejoindre
                </p>
              </div>

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <Button
                  size="sm"
                  variant={isVideoOn ? "default" : "secondary"}
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className="rounded-full"
                >
                  {isVideoOn ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <VideoOff className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant={isAudioOn ? "default" : "secondary"}
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  className="rounded-full"
                >
                  {isAudioOn ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{matiere}</span>
              <Badge variant={canJoin ? "default" : "secondary"}>
                {canJoin ? "Prêt à rejoindre" : "En attente"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>
                  {tutorName?.charAt(0) || "T"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{tutorName || "Tuteur"}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(sessionDate), "PPP 'à' HH:mm", { locale: fr })}
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-center font-medium">{timeUntilStart}</p>
            </div>

            <Button
              onClick={onJoin}
              disabled={!canJoin}
              className="w-full"
              size="lg"
            >
              {canJoin ? (
                "Rejoindre la session"
              ) : (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  En attente du début
                </>
              )}
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              Vous pourrez rejoindre la session 5 minutes avant l'heure prévue
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
