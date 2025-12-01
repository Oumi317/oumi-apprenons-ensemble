import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get sessions starting in 30 minutes
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const thirtyFiveMinutesFromNow = new Date(now.getTime() + 35 * 60 * 1000);

    const { data: upcomingSessions, error } = await supabase
      .from("sessions_tutorat")
      .select(`
        id,
        date_heure_debut,
        matiere,
        etudiant_id,
        tuteur_id,
        students (
          prenom,
          parent_id
        )
      `)
      .eq("statut", "programmee")
      .gte("date_heure_debut", thirtyMinutesFromNow.toISOString())
      .lt("date_heure_debut", thirtyFiveMinutesFromNow.toISOString());

    if (error) throw error;

    if (!upcomingSessions || upcomingSessions.length === 0) {
      return new Response(JSON.stringify({ message: "No upcoming sessions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create notifications for each upcoming session
    const notifications = [];
    
    for (const session of upcomingSessions) {
      const student = session.students as any;
      const sessionTime = new Date(session.date_heure_debut);
      const formattedTime = sessionTime.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Check if notification already exists for this session
      const { data: existingNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("metadata->>session_id", session.id)
        .eq("type", "session_reminder")
        .single();

      if (existingNotif) continue; // Skip if already notified

      // Notify parent
      notifications.push({
        user_id: student.parent_id,
        type: "session_reminder",
        title: "Session à venir",
        message: `La session de ${session.matiere} pour ${student.prenom} commence dans 30 minutes (${formattedTime})`,
        link: `/video-session/${session.id}`,
        metadata: { session_id: session.id }
      });

      // Notify tutor
      notifications.push({
        user_id: session.tuteur_id,
        type: "session_reminder",
        title: "Session à venir",
        message: `Votre session de ${session.matiere} avec ${student.prenom} commence dans 30 minutes (${formattedTime})`,
        link: `/video-session/${session.id}`,
        metadata: { session_id: session.id }
      });
    }

    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsCreated: notifications.length 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error checking upcoming sessions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
