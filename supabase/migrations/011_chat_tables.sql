-- Chat system tables
CREATE TABLE IF NOT EXISTS chat_channels (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text DEFAULT 'channel' CHECK (type IN ('channel', 'dm')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id),
  sender_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id, created_at);

-- Enable RLS
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies — all auth users can read/write
CREATE POLICY "Auth read channels" ON chat_channels FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read messages" ON chat_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime on chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Seed default channels
INSERT INTO chat_channels (id, name, type) VALUES
  ('general', 'general', 'channel'),
  ('brand', 'brand', 'channel'),
  ('pr', 'pr', 'channel'),
  ('dev', 'dev', 'channel'),
  ('accounts', 'accounts', 'channel')
ON CONFLICT (id) DO NOTHING;
