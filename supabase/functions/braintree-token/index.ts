import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // GraphQL mutation to create client token
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
      console.error('Braintree API error response:', error);
      throw new Error(`Braintree API error: ${error}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    const clientToken = data.data?.createClientToken?.clientToken;
    
    if (!clientToken) {
      throw new Error('No client token in response');
    }

    return new Response(
      JSON.stringify({ clientToken }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating Braintree token:', error);
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
