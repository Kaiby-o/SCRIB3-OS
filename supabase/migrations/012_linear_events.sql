-- Linear webhook event storage + notifications table

CREATE TABLE IF NOT EXISTS linear_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  linear_id text,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_linear_events_type ON linear_events(event_type);
CREATE INDEX IF NOT EXISTS idx_linear_events_created ON linear_events(created_at);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  type text NOT NULL,
  title text NOT NULL,
  body text,
  metadata jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at);

-- RLS
ALTER TABLE linear_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read linear_events" ON linear_events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service insert linear_events" ON linear_events FOR INSERT WITH CHECK (true); -- Edge function uses service key
CREATE POLICY "Auth read own notifications" ON notifications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update own notifications" ON notifications FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Enable realtime on notifications for push updates
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
