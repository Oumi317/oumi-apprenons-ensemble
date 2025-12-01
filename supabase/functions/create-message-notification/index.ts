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

    const { messageId } = await req.json();

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
      throw new Error("Message not found");
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

    // Create notification
    await supabase.from("notifications").insert({
      user_id: recipientId,
      type: "new_message",
      title: "Nouveau message",
      message: `${senderName}: ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}`,
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
