-- Push notification subscriptions for Web Push API (VAPID)
-- Each row represents one browser/device subscription for a user.

CREATE TABLE push_subscriptions (
  id                  uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint            text        NOT NULL UNIQUE,
  p256dh              text        NOT NULL,
  auth                text        NOT NULL,
  lang                text        NOT NULL DEFAULT 'pt-BR',
  notifications_enabled boolean   NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own subscriptions
CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger: keep updated_at current
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Index for fast user-based queries
CREATE INDEX push_subscriptions_user_id_idx ON push_subscriptions (user_id);
