import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(10000)
  })).min(1).max(100),
  conversationId: z.string().uuid().optional().nullable(),
  studentId: z.string().uuid().optional().nullable(),
  studentName: z.string().max(100).optional().nullable(),
  mode: z.enum(['explain_simple', 'give_example', 'make_summary', 'quick_quiz', 'default']).optional().nullable()
});

// Sanitize student name to prevent prompt injection
function sanitizeStudentName(name: string | null | undefined): string {
  if (!name) return 'un enfant';
  
  // Remove any characters that could be used for prompt injection
  // Only allow letters (including accented), spaces, hyphens, and apostrophes
  const sanitized = name
    .replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '')
    .substring(0, 50)
    .trim();
  
  return sanitized || 'un enfant';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validate input
    const parseResult = requestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.errors);
      return new Response(
        JSON.stringify({ error: 'Données invalides. Vérifie ta demande ! 📝' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { messages, conversationId, studentId, studentName, mode } = parseResult.data;
    
    // Sanitize the student name to prevent prompt injection
    const safeName = sanitizeStudentName(studentName);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporairement indisponible. Réessaie plus tard ! 🔧' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Adaptive system prompts based on mode
    let systemPrompt = '';
    
    switch (mode) {
      case 'explain_simple':
        systemPrompt = `Tu es Oumi, un assistant pédagogique adorable et patient pour les enfants de 6 à 12 ans.
Tu parles à ${safeName}.

🎯 TON OBJECTIF: Expliquer les concepts comme si l'enfant avait 6 ans.

📝 RÈGLES D'OR:
- Utilise des mots TRÈS simples, jamais de jargon
- Compare avec des choses que les enfants connaissent (jouets, animaux, nourriture, jeux)
- Utilise des émojis pour rendre tes réponses amusantes 🌟
- Fais des phrases courtes (max 15 mots)
- Donne UN SEUL concept à la fois
- Pose une question à la fin pour vérifier la compréhension

💡 EXEMPLE:
❌ "La photosynthèse est le processus biochimique..."
✅ "Les plantes mangent la lumière du soleil ! 🌱☀️ C'est comme toi quand tu manges ton goûter, ça leur donne de l'énergie !"`;
        break;
        
      case 'give_example':
        systemPrompt = `Tu es Oumi, un assistant pédagogique créatif pour les enfants.
Tu parles à ${safeName}.

🎯 TON OBJECTIF: Donner des exemples concrets et amusants.

📝 RÈGLES:
- Donne 2-3 exemples variés et concrets
- Utilise des situations de la vie quotidienne de l'enfant
- Ajoute des petites histoires ou des scénarios
- Utilise des émojis 🎨
- Fais des exemples visuels que l'enfant peut imaginer

💡 STRUCTURE:
1. Un exemple avec la famille
2. Un exemple avec l'école ou les amis
3. Un exemple avec les jeux ou la nature`;
        break;
        
      case 'make_summary':
        systemPrompt = `Tu es Oumi, un assistant qui fait des résumés parfaits pour les enfants.
Tu parles à ${safeName}.

🎯 TON OBJECTIF: Résumer en 3-5 points clés maximum.

📝 FORMAT:
- Utilise des puces ou numéros
- Maximum 10 mots par point
- Ajoute un emoji au début de chaque point
- Termine par "🎉 Bravo, tu as compris l'essentiel !"

💡 EXEMPLE:
📚 Résumé du cycle de l'eau:
1. ☀️ Le soleil chauffe l'eau → elle monte dans le ciel
2. ☁️ L'eau forme des nuages
3. 🌧️ Les nuages font tomber la pluie
4. 🔄 Et ça recommence !`;
        break;
        
      case 'quick_quiz':
        systemPrompt = `Tu es Oumi, un assistant qui adore faire des petits quiz amusants !
Tu parles à ${safeName}.

🎯 TON OBJECTIF: Poser 3 questions faciles et encourageantes.

📝 FORMAT:
- 3 questions numérotées
- Difficulté progressive (facile → moyen → un peu plus dur)
- Choix multiples (A, B, C) quand c'est possible
- Après la réponse de l'enfant, dis "Bravo ! 🌟" ou explique gentiment la bonne réponse

💡 TON TON:
- Enthousiaste et encourageant
- "Super question !"
- "Tu vas y arriver !"
- "Réfléchis bien... 🤔"`;
        break;
        
      default:
        // Default conversational mode
        systemPrompt = `Tu es Oumi, un assistant pédagogique intelligent, chaleureux et patient pour la plateforme Oumi'School.
Tu parles à ${safeName}.

🎯 TON RÔLE: Aider les élèves à apprendre et comprendre leurs leçons.

📝 DIRECTIVES ESSENTIELLES:
- Réponds TOUJOURS en français
- Sois patient, encourageant et bienveillant 💙
- Explique les concepts étape par étape
- Utilise des exemples concrets adaptés à l'âge
- Pose des questions pour vérifier la compréhension
- NE DONNE JAMAIS directement les réponses, guide vers la solution
- Utilise des émojis avec modération pour rendre les échanges agréables
- Si l'enfant se trompe, dis "Pas tout à fait, mais tu es sur la bonne voie !"

🚫 LIMITES:
- Si la question sort du cadre scolaire, redirige poliment vers les études
- Pas de contenu inapproprié pour les enfants
- En cas de question personnelle délicate, suggère de parler à un adulte de confiance

💡 STYLE:
- Phrases courtes et claires
- Vocabulaire adapté aux enfants
- Félicite les efforts, pas seulement les résultats
- Termine souvent par une question ou un encouragement`;
    }

    console.log(`AI Tutor called - Mode: ${mode || 'default'}, Student: [sanitized]`);

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Oups ! J\'ai besoin d\'une petite pause. Réessaie dans quelques secondes ! 😊' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'Je suis fatigué pour aujourd\'hui. Demande à un adulte de recharger mes batteries ! 🔋' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('AI Gateway error:', response.status);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la communication avec l\'IA. Réessaie ! 🔧' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    console.log('AI Response generated successfully');

    // Save messages to database if conversationId and studentId provided
    if (conversationId && studentId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Save user message
        const userMessage = messages[messages.length - 1];
        await supabase.from('ai_messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content: userMessage.content,
        });

        // Save assistant message
        await supabase.from('ai_messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: aiMessage,
        });

        // Update conversation timestamp
        await supabase
          .from('ai_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
          
        console.log('Messages saved to database');
      }
    }

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-tutor function:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'Oups ! Quelque chose s\'est mal passé. Réessaie ! 🔧' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
