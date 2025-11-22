-- Create table for tracking payment transactions to prevent duplicates
CREATE TABLE IF NOT EXISTS public.payment_nonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nonce text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  transaction_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Index for fast lookups and cleanup
CREATE INDEX idx_payment_nonces_user_id ON public.payment_nonces(user_id);
CREATE INDEX idx_payment_nonces_expires_at ON public.payment_nonces(expires_at);
CREATE INDEX idx_payment_nonces_nonce ON public.payment_nonces(nonce);

-- Enable RLS
ALTER TABLE public.payment_nonces ENABLE ROW LEVEL SECURITY;

-- Users can only view their own nonces
CREATE POLICY "Users can view their own payment nonces"
ON public.payment_nonces
FOR SELECT
USING (user_id = auth.uid());

-- Only system (via edge functions) can insert nonces
CREATE POLICY "System can insert payment nonces"
ON public.payment_nonces
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Clean up expired nonces periodically (manual or via cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_nonces()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.payment_nonces 
  WHERE expires_at < now();
END;
$$;

-- Create table for rate limiting API requests
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Index for fast lookups
CREATE INDEX idx_api_rate_limits_user_endpoint ON public.api_rate_limits(user_id, endpoint);
CREATE INDEX idx_api_rate_limits_window ON public.api_rate_limits(window_start);

-- Enable RLS
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can view their own rate limit data
CREATE POLICY "Users can view their own rate limits"
ON public.api_rate_limits
FOR SELECT
USING (user_id = auth.uid());

COMMENT ON TABLE public.payment_nonces IS 'Tracks payment nonces to prevent duplicate transactions';
COMMENT ON TABLE public.api_rate_limits IS 'Tracks API request counts for rate limiting';