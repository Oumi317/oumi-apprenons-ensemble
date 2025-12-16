import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Users, Clock, BookOpen, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

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
  const [notes, setNotes] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    loadSession();
    checkUser();
  }, [sessionId]);

  // Timer for session duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStarted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStarted]);

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

  const startSession = async () => {
    setSessionStarted(true);
    await supabase
      .from("sessions_tutorat")
      .update({ statut: "en_cours" })
      .eq("id", sessionId);
    
    setSession(prev => prev ? { ...prev, statut: "en_cours" } : null);
    toast({
      title: "Session démarrée",
      description: "La session de tutorat a commencé",
    });
  };

  const endCall = async () => {
    try {
      await supabase
        .from("sessions_tutorat")
        .update({ statut: "completee", notes_tuteur: notes || null })
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Connexion à la session...</p>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Session introuvable</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{session.matiere}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(session.date_heure_debut), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sessionStarted && (
                    <Badge variant="outline" className="text-lg px-3 py-1 border-red-500 text-red-500">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                      {formatTime(timeElapsed)}
                    </Badge>
                  )}
                  <Badge 
                    variant={session.statut === "en_cours" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {session.statut.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-4">
          {/* Main Video Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative">
                  {/* Placeholder video grid */}
                  <div className="absolute inset-4 grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 rounded-xl flex items-center justify-center border border-slate-600/30">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                          <Users className="h-10 w-10 text-primary" />
                        </div>
                        <p className="text-white/80 font-medium">Tuteur</p>
                        <p className="text-white/50 text-sm">En attente...</p>
                      </div>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl flex items-center justify-center border border-slate-600/30">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                          <Users className="h-10 w-10 text-accent" />
                        </div>
                        <p className="text-white/80 font-medium">Élève</p>
                        <p className="text-white/50 text-sm">En attente...</p>
                      </div>
                    </div>
                  </div>

                  {/* Overlay for non-started session */}
                  <AnimatePresence>
                    {!sessionStarted && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                      >
                        <div className="text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <Video className="h-16 w-16 mx-auto mb-4 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-bold text-white mb-2">Prêt à commencer ?</h3>
                          <p className="text-white/70 mb-6 max-w-sm">
                            Cliquez sur le bouton ci-dessous pour démarrer la session de tutorat
                          </p>
                          <Button size="lg" onClick={startSession} className="gap-2">
                            <Video className="h-5 w-5" />
                            Démarrer la session
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Controls Bar */}
                <div className="p-4 bg-card border-t flex items-center justify-center gap-3">
                  <Button
                    size="lg"
                    variant={isVideoOn ? "default" : "secondary"}
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className="rounded-full h-14 w-14 p-0"
                  >
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>

                  <Button
                    size="lg"
                    variant={isAudioOn ? "default" : "secondary"}
                    onClick={() => setIsAudioOn(!isAudioOn)}
                    className="rounded-full h-14 w-14 p-0"
                  >
                    {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>

                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={endCall}
                    className="rounded-full h-14 w-14 p-0"
                  >
                    <PhoneOff className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Session Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durée prévue</span>
                  <span className="font-medium">{session.duree_minutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <Badge variant="outline" className="capitalize">
                    {session.statut.replace("_", " ")}
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <Button
                    onClick={copyMeetingLink}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copier le lien
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Notes de session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Prenez des notes pendant la session..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
