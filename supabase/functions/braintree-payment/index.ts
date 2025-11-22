import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit: 50 payments per day per user
const RATE_LIMIT = 50;
const RATE_WINDOW_HOURS = 24;

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

    // Step 2: Parse and validate request data
    const { paymentMethodNonce, amount, description } = await req.json();

    if (!paymentMethodNonce || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required payment information' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment amount' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (parsedAmount < 0.01 || parsedAmount > 10000) {
      return new Response(
        JSON.stringify({ error: 'Payment amount out of acceptable range' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Step 3: Check for duplicate nonce (transaction deduplication)
    const { data: existingNonce } = await supabaseClient
      .from('payment_nonces')
      .select('id, status, transaction_id')
      .eq('nonce', paymentMethodNonce)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingNonce) {
      console.warn(`[DEDUP] Duplicate nonce detected for user ${user.id}`);
      
      if (existingNonce.status === 'completed' && existingNonce.transaction_id) {
        return new Response(
          JSON.stringify({ 
            success: true,
            transactionId: existingNonce.transaction_id,
            status: 'DUPLICATE',
            message: 'This transaction was already processed'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'This payment is already being processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      );
    }

    // Step 4: Check rate limit
    const windowStart = new Date(Date.now() - RATE_WINDOW_HOURS * 60 * 60 * 1000);
    
    const { data: rateLimitData, error: rateLimitError } = await supabaseClient
      .from('api_rate_limits')
      .select('request_count')
      .eq('user_id', user.id)
      .eq('endpoint', 'braintree-payment')
      .gte('window_start', windowStart.toISOString())
      .maybeSingle();

    if (rateLimitError) {
      console.error('[RATE_LIMIT] Error checking rate limit:', rateLimitError);
    }

    const currentCount = rateLimitData?.request_count || 0;
    
    if (currentCount >= RATE_LIMIT) {
      console.warn(`[RATE_LIMIT] User ${user.id} exceeded payment rate limit`);
      return new Response(
        JSON.stringify({ error: 'Daily payment limit exceeded. Please contact support.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Step 5: Verify user has payment authorization
    const { data: parent } = await supabaseClient
      .from('parents')
      .select('abonnement_actif, type_abonnement')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!parent) {
      console.warn(`[AUTH] User ${user.id} is not authorized for payments`);
      return new Response(
        JSON.stringify({ error: 'Payment access denied' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Step 6: Record nonce to prevent duplicates
    const { error: nonceError } = await supabaseClient
      .from('payment_nonces')
      .insert({
        nonce: paymentMethodNonce,
        user_id: user.id,
        amount: parsedAmount,
        status: 'processing'
      });

    if (nonceError) {
      console.error('[NONCE] Failed to record nonce:', nonceError);
      return new Response(
        JSON.stringify({ error: 'Payment processing error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Step 7: Process payment with Braintree
    const merchantId = Deno.env.get('BRAINTREE_MERCHANT_ID');
    const publicKey = Deno.env.get('BRAINTREE_PUBLIC_KEY');
    const privateKey = Deno.env.get('BRAINTREE_PRIVATE_KEY');

    if (!merchantId || !publicKey || !privateKey) {
      console.error('[CONFIG] Braintree credentials not configured');
      
      // Mark nonce as failed
      await supabaseClient
        .from('payment_nonces')
        .update({ status: 'failed' })
        .eq('nonce', paymentMethodNonce);
      
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
      mutation ChargePaymentMethod($input: ChargePaymentMethodInput!) {
        chargePaymentMethod(input: $input) {
          transaction {
            id
            legacyId
            status
            amount {
              value
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        paymentMethodId: paymentMethodNonce,
        transaction: {
          amount: amount.toString(),
        },
      },
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Braintree-Version': '2019-01-01',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[BRAINTREE] API error:', error);
      
      // Mark nonce as failed
      await supabaseClient
        .from('payment_nonces')
        .update({ status: 'failed' })
        .eq('nonce', paymentMethodNonce);
      
      return new Response(
        JSON.stringify({ error: 'Payment processing failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('[BRAINTREE] GraphQL errors:', result.errors);
      
      // Mark nonce as failed
      await supabaseClient
        .from('payment_nonces')
        .update({ status: 'failed' })
        .eq('nonce', paymentMethodNonce);
      
      return new Response(
        JSON.stringify({ error: 'Payment transaction failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const transaction = result.data?.chargePaymentMethod?.transaction;
    
    if (!transaction) {
      console.error('[BRAINTREE] No transaction in response');
      
      // Mark nonce as failed
      await supabaseClient
        .from('payment_nonces')
        .update({ status: 'failed' })
        .eq('nonce', paymentMethodNonce);
      
      return new Response(
        JSON.stringify({ error: 'Payment processing failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Step 8: Record successful payment
    const paymentStatus = transaction.status === 'SUBMITTED_FOR_SETTLEMENT' ? 'reussi' : 'en_attente';
    
    await supabaseClient.from('payments').insert({
      user_id: user.id,
      montant: parsedAmount,
      pour_quoi: description || 'Payment via Braintree',
      methode_paiement: 'braintree',
      statut: paymentStatus,
      transaction_id: transaction.legacyId,
      metadata: { 
        braintreeTransactionId: transaction.id,
        amount: transaction.amount.value,
        status: transaction.status 
      }
    });

    // Step 9: Update nonce status and transaction ID
    await supabaseClient
      .from('payment_nonces')
      .update({ 
        status: 'completed',
        transaction_id: transaction.legacyId 
      })
      .eq('nonce', paymentMethodNonce);

    // Step 10: Update rate limit
    const rateLimitWindowStart = new Date();
    rateLimitWindowStart.setHours(0, 0, 0, 0);
    
    await supabaseClient
      .from('api_rate_limits')
      .upsert({
        user_id: user.id,
        endpoint: 'braintree-payment',
        window_start: rateLimitWindowStart.toISOString(),
        request_count: currentCount + 1,
      }, {
        onConflict: 'user_id,endpoint,window_start'
      });

    console.log(`[SUCCESS] Payment processed for user ${user.id}, transaction ${transaction.legacyId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        transactionId: transaction.legacyId,
        status: transaction.status 
      }),
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
