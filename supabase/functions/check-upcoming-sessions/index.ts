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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authentication check - require valid JWT from admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth to verify their identity
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // Verify user has admin role using service client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: adminCheck, error: adminError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (adminError || !adminCheck) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
