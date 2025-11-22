import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 50 requests per hour per user
const RATE_LIMIT = 50;
const RATE_WINDOW_HOURS = 1;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('[AUTH] Authentication failed');
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`[AUTH] User authenticated: ${user.id}`);

    // Step 2: Check rate limit
    const windowStart = new Date();
    windowStart.setMinutes(0, 0, 0);
    
    const { data: rateLimitData, error: rateLimitError } = await supabaseClient
      .from('api_rate_limits')
      .select('request_count')
      .eq('user_id', user.id)
      .eq('endpoint', 'braintree-token')
      .gte('window_start', new Date(Date.now() - RATE_WINDOW_HOURS * 60 * 60 * 1000).toISOString())
      .maybeSingle();

    if (rateLimitError) {
      console.error('[RATE_LIMIT] Error checking rate limit:', rateLimitError);
    }

    const currentCount = rateLimitData?.request_count || 0;
    
    if (currentCount >= RATE_LIMIT) {
      console.warn(`[RATE_LIMIT] User ${user.id} exceeded rate limit`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Step 3: Verify user has active subscription or permission to request tokens
    const { data: parent } = await supabaseClient
      .from('parents')
      .select('abonnement_actif')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!parent) {
      console.warn(`[AUTH] User ${user.id} is not a parent`);
      return new Response(
        JSON.stringify({ error: 'Payment access denied' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Step 4: Update rate limit
    await supabaseClient
      .from('api_rate_limits')
      .upsert({
        user_id: user.id,
        endpoint: 'braintree-token',
        window_start: windowStart.toISOString(),
        request_count: currentCount + 1,
      }, {
        onConflict: 'user_id,endpoint,window_start'
      });

    // Step 5: Generate Braintree token
    const merchantId = Deno.env.get('BRAINTREE_MERCHANT_ID');
    const publicKey = Deno.env.get('BRAINTREE_PUBLIC_KEY');
    const privateKey = Deno.env.get('BRAINTREE_PRIVATE_KEY');

    if (!merchantId || !publicKey || !privateKey) {
      console.error('[CONFIG] Braintree credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service unavailable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      );
    }

    const auth = btoa(`${publicKey}:${privateKey}`);
    const environment = Deno.env.get('BRAINTREE_ENVIRONMENT') === 'production' 
      ? 'production' 
      : 'sandbox';

    const apiUrl = environment === 'production'
      ? 'https://payments.braintree-api.com/graphql'
      : 'https://payments.sandbox.braintree-api.com/graphql';

    const query = `
      mutation {
        createClientToken(input: {
          clientToken: {}
        }) {
          clientToken
        }
      }
    `;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Braintree-Version': '2019-01-01',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[BRAINTREE] API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate payment token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('[BRAINTREE] GraphQL errors:', data.errors);
      return new Response(
        JSON.stringify({ error: 'Payment service error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const clientToken = data.data?.createClientToken?.clientToken;
    
    if (!clientToken) {
      console.error('[BRAINTREE] No client token in response');
      return new Response(
        JSON.stringify({ error: 'Failed to generate payment token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`[SUCCESS] Token generated for user ${user.id}`);

    return new Response(
      JSON.stringify({ clientToken }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[ERROR] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
