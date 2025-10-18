import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BraintreePaymentProps {
  amount: number;
  description: string;
  onSuccess?: () => void;
}

export const BraintreePayment = ({ amount, description, onSuccess }: BraintreePaymentProps) => {
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeBraintree = async () => {
      try {
        // Get client token from edge function
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/braintree-token`,
          {
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          }
        );

        const { clientToken } = await response.json();

        // Dynamically import braintree-web-drop-in
        const dropin = await import('braintree-web-drop-in');
        
        // Initialize Braintree Drop-in
        const dropinInstance = await dropin.default.create({
          authorization: clientToken,
          container: containerRef.current!,
          card: {
            cardholderName: {
              required: true
            }
          }
        });

        setInstance(dropinInstance);
      } catch (error) {
        console.error("Error initializing Braintree:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'initialiser le système de paiement",
          variant: "destructive",
        });
      }
    };

    if (containerRef.current) {
      initializeBraintree();
    }

    return () => {
      if (instance) {
        instance.teardown();
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!instance) return;

    setLoading(true);

    try {
      const { nonce } = await instance.requestPaymentMethod();

      // Process payment via edge function
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/braintree-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            paymentMethodNonce: nonce,
            amount: amount,
            description: description,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Paiement réussi",
          description: "Votre paiement a été traité avec succès",
        });
        onSuccess?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Erreur de paiement",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiement sécurisé</CardTitle>
        <CardDescription>
          Montant: {amount.toFixed(2)} €
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="mb-4" />
        <Button 
          onClick={handlePayment} 
          disabled={loading || !instance}
          className="w-full"
        >
          {loading ? "Traitement..." : `Payer ${amount.toFixed(2)} €`}
        </Button>
      </CardContent>
    </Card>
  );
};
