-- Table pour les codes de parrainage
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  reward_months INTEGER NOT NULL DEFAULT 1,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les parrainages effectués
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  reward_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  UNIQUE(referred_id)
);

-- Table pour les récompenses de parrainage
CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('free_month', 'discount', 'credits')),
  reward_value NUMERIC NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
  ON public.referral_codes FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Everyone can view active referral codes for validation"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

-- RLS policies for referrals
CREATE POLICY "Users can view referrals they made or received"
  ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can create referrals as referred"
  ON public.referrals FOR INSERT
  WITH CHECK (referred_id = auth.uid());

-- RLS policies for referral_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.referral_rewards FOR SELECT
  USING (user_id = auth.uid());

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8));
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Function to apply referral
CREATE OR REPLACE FUNCTION public.apply_referral(p_code TEXT, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_code RECORD;
  v_referral_id UUID;
BEGIN
  -- Check if user already used a referral
  IF EXISTS(SELECT 1 FROM referrals WHERE referred_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Vous avez déjà utilisé un code de parrainage');
  END IF;

  -- Get referral code
  SELECT * INTO v_referral_code
  FROM referral_codes
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR current_uses < max_uses)
    AND owner_id != p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code de parrainage invalide ou expiré');
  END IF;

  -- Create referral
  INSERT INTO referrals (referrer_id, referred_id, referral_code_id, status)
  VALUES (v_referral_code.owner_id, p_user_id, v_referral_code.id, 'pending')
  RETURNING id INTO v_referral_id;

  -- Update code usage
  UPDATE referral_codes SET current_uses = current_uses + 1 WHERE id = v_referral_code.id;

  -- Create rewards for both users
  INSERT INTO referral_rewards (user_id, referral_id, reward_type, reward_value, expires_at)
  VALUES 
    (p_user_id, v_referral_id, 'free_month', v_referral_code.reward_months, now() + INTERVAL '30 days'),
    (v_referral_code.owner_id, v_referral_id, 'free_month', 1, now() + INTERVAL '30 days');

  RETURN jsonb_build_object('success', true, 'reward_months', v_referral_code.reward_months);
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_referral_codes_updated_at
  BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();