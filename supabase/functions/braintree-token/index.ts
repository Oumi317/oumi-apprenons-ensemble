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

    const auth = btoa(`${publicKey}:${privateKey}`);
    const environment = 'sandbox'; // Change to 'production' when ready

    // Generate client token
    const response = await fetch(
      `https://api.${environment}.braintreegateway.com/merchants/${merchantId}/client_token`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_token: {}
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Braintree API error: ${error}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ clientToken: data.clientToken }),
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
