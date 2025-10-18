import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentMethodNonce, amount, description } = await req.json();

    if (!paymentMethodNonce || !amount) {
      throw new Error('Missing required payment data');
    }

    const merchantId = Deno.env.get('BRAINTREE_MERCHANT_ID');
    const publicKey = Deno.env.get('BRAINTREE_PUBLIC_KEY');
    const privateKey = Deno.env.get('BRAINTREE_PRIVATE_KEY');

    if (!merchantId || !publicKey || !privateKey) {
      throw new Error('Braintree credentials not configured');
    }

    const auth = btoa(`${publicKey}:${privateKey}`);
    const environment = 'sandbox'; // Change to 'production' when ready

    // Process payment
    const response = await fetch(
      `https://api.${environment}.braintreegateway.com/merchants/${merchantId}/transactions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction: {
            type: 'sale',
            amount: amount,
            paymentMethodNonce: paymentMethodNonce,
            options: {
              submitForSettlement: true
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Braintree transaction error: ${error}`);
    }

    const result = await response.json();

    // Record payment in database
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
      await supabaseClient.from('payments').insert({
        user_id: user.id,
        montant: amount,
        pour_quoi: description || 'Payment via Braintree',
        methode_paiement: 'braintree',
        statut: result.transaction.status === 'submitted_for_settlement' ? 'complete' : 'en_attente',
        transaction_id: result.transaction.id,
        metadata: { braintreeResult: result }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        transactionId: result.transaction.id,
        status: result.transaction.status 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
