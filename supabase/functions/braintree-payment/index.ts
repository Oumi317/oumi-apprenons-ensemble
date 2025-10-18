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

    // Create Base64 encoded authorization
    const auth = btoa(`${publicKey}:${privateKey}`);
    const environment = Deno.env.get('BRAINTREE_ENVIRONMENT') === 'production' 
      ? 'production' 
      : 'sandbox';

    const apiUrl = environment === 'production'
      ? 'https://payments.braintree-api.com/graphql'
      : 'https://payments.sandbox.braintree-api.com/graphql';

    // GraphQL mutation to charge payment method
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
        options: {
          submitForSettlement: true,
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
      console.error('Braintree API error response:', error);
      throw new Error(`Braintree transaction error: ${error}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(result.errors[0]?.message || 'Transaction failed');
    }

    const transaction = result.data?.chargePaymentMethod?.transaction;
    
    if (!transaction) {
      throw new Error('No transaction in response');
    }

    // Record payment in database
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
      await supabaseClient.from('payments').insert({
        user_id: user.id,
        montant: parseFloat(amount),
        pour_quoi: description || 'Payment via Braintree',
        methode_paiement: 'braintree',
        statut: transaction.status === 'SUBMITTED_FOR_SETTLEMENT' ? 'complete' : 'en_attente',
        transaction_id: transaction.legacyId,
        metadata: { braintreeResult: result }
      });
    }

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
