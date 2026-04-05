-- Credits System Tables

-- 1. User Credits Balance Table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Credit Transactions Table (History)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'refund')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Credit Packages Table (Pricing)
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  bonus_credits INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (T1 - Private User Data)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_credits" ON user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_credits" ON user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_credits" ON user_credits FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_transactions" ON credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_packages" ON credit_packages FOR SELECT USING (true);

-- Insert default credit packages
INSERT INTO credit_packages (name, credits, price_usd, bonus_credits, display_order) VALUES
  ('Starter', 50, 5.00, 0, 1),
  ('Basic', 120, 10.00, 20, 2),
  ('Pro', 300, 25.00, 50, 3),
  ('Premium', 650, 50.00, 150, 4),
  ('Ultimate', 1500, 100.00, 500, 5)
ON CONFLICT DO NOTHING;

-- Function to update user_credits.updated_at
CREATE OR REPLACE FUNCTION update_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_credits_updated_at
BEFORE UPDATE ON user_credits
FOR EACH ROW
EXECUTE FUNCTION update_credits_updated_at();

-- Function to automatically create user_credits when a profile is created
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance)
  VALUES (NEW.id, 50)  -- Give 50 free credits on signup
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_user_credits();