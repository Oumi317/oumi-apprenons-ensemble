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

    // Authentication check - require valid JWT
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

    // Parse and validate request body
    const { messageId } = await req.json();
    
    if (!messageId || typeof messageId !== "string") {
      return new Response(
        JSON.stringify({ error: "Bad request - messageId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get message details
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        sender_id,
        conversation_id,
        conversations (
          parent_id,
          tutor_id,
          student_id
        )
      `)
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      return new Response(
        JSON.stringify({ error: "Message not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the authenticated user is the sender of the message
    if (message.sender_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Forbidden - You can only create notifications for your own messages" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const conversation = message.conversations as any;
    
    // Determine recipient (not the sender)
    let recipientId = conversation.parent_id;
    if (message.sender_id === conversation.parent_id) {
      recipientId = conversation.tutor_id;
    }

    // Get sender's name
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("prenom, nom")
      .eq("id", message.sender_id)
      .single();

    const senderName = senderProfile 
      ? `${senderProfile.prenom} ${senderProfile.nom}`
      : "Un utilisateur";

    // Sanitize message content for notification (prevent XSS in notification text)
    const sanitizedContent = message.content
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .substring(0, 100);
    
    const notificationMessage = `${senderName}: ${sanitizedContent}${message.content.length > 100 ? '...' : ''}`;

    // Create notification
    await supabase.from("notifications").insert({
      user_id: recipientId,
      type: "new_message",
      title: "Nouveau message",
      message: notificationMessage,
      link: "/messages",
      metadata: { message_id: messageId, conversation_id: message.conversation_id }
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
