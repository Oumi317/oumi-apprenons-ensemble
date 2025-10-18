import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Session {
  id: string;
  matiere: string;
  date_heure_debut: string;
  duree_minutes: number;
  lien_zoom: string | null;
  statut: string;
  etudiant_id: string;
  tuteur_id: string;
}

export default function VideoConferenceRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadSession();
    checkUser();
  }, [sessionId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions_tutorat")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      setSession(data);

      // Generate meeting link if not exists
      if (!data.lien_zoom) {
        await generateMeetingLink(data.id);
      }
    } catch (error) {
      console.error("Error loading session:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMeetingLink = async (sessionId: string) => {
    const meetingLink = `https://meet.lovable.app/${sessionId}`;
    
    const { error } = await supabase
      .from("sessions_tutorat")
      .update({ lien_zoom: meetingLink })
      .eq("id", sessionId);

    if (!error) {
      setSession(prev => prev ? { ...prev, lien_zoom: meetingLink } : null);
    }
  };

  const copyMeetingLink = async () => {
    if (session?.lien_zoom) {
      await navigator.clipboard.writeText(session.lien_zoom);
      setLinkCopied(true);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papier",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const endCall = async () => {
    try {
      await supabase
        .from("sessions_tutorat")
        .update({ statut: "completee" })
        .eq("id", sessionId);

      toast({
        title: "Session terminée",
        description: "La session a été marquée comme terminée",
      });
      navigate(-1);
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Session introuvable</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{session.matiere}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(session.date_heure_debut), "PPP 'à' HH:mm", { locale: fr })}
                </p>
              </div>
              <Badge variant={session.statut === "en_cours" ? "default" : "secondary"}>
                {session.statut}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Video Area */}
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-muted flex items-center justify-center relative">
              <div className="text-center">
                <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Salle de visioconférence</p>
                <p className="text-sm text-muted-foreground mt-2">
                  La vidéo apparaîtra ici une fois connecté
                </p>
                {session.lien_zoom && (
                  <Button
                    onClick={copyMeetingLink}
                    variant="outline"
                    className="mt-4"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copier le lien
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant={isVideoOn ? "default" : "secondary"}
                onClick={() => setIsVideoOn(!isVideoOn)}
                className="rounded-full h-14 w-14 p-0"
              >
                {isVideoOn ? (
                  <Video className="h-6 w-6" />
                ) : (
                  <VideoOff className="h-6 w-6" />
                )}
              </Button>

              <Button
                size="lg"
                variant={isAudioOn ? "default" : "secondary"}
                onClick={() => setIsAudioOn(!isAudioOn)}
                className="rounded-full h-14 w-14 p-0"
              >
                {isAudioOn ? (
                  <Mic className="h-6 w-6" />
                ) : (
                  <MicOff className="h-6 w-6" />
                )}
              </Button>

              <Button
                size="lg"
                variant="destructive"
                onClick={endCall}
                className="rounded-full h-14 w-14 p-0"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Durée prévue</p>
                <p className="font-medium">{session.duree_minutes} minutes</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lien de la session</p>
                <p className="font-medium truncate">{session.lien_zoom || "Génération..."}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
