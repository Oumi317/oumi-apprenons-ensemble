import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import WaitingRoom from "@/components/WaitingRoom";
import VideoConferenceRoom from "@/components/VideoConferenceRoom";

export default function VideoSession() {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [inWaitingRoom, setInWaitingRoom] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const { data, error } = await supabase
        .from("sessions_tutorat")
        .select(`
          *,
          tutors (
            user_id,
            profiles (prenom, nom)
          )
        `)
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      setSession(data);

      // Auto-join if session already started
      const now = new Date();
      const sessionTime = new Date(data.date_heure_debut);
      if (now >= sessionTime) {
        setInWaitingRoom(false);
      }
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = () => {
    setInWaitingRoom(false);
    
    // Update session status to programmee (keeping existing status)
    console.log("Session joined");
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
        <p>Session introuvable</p>
      </div>
    );
  }

  if (inWaitingRoom) {
    const tutorProfile = session.tutors?.[0]?.profiles?.[0];
    const tutorName = tutorProfile
      ? `${tutorProfile.prenom} ${tutorProfile.nom}`
      : undefined;

    return (
      <WaitingRoom
        sessionId={session.id}
        sessionDate={session.date_heure_debut}
        matiere={session.matiere}
        tutorName={tutorName}
        onJoin={handleJoinSession}
      />
    );
  }

  return <VideoConferenceRoom />;
}
