-- ===================================================================
-- SCRIB3-OS Schema Fix — creates only what's missing
-- Run in Supabase SQL Editor
-- ===================================================================

-- 1. Add missing columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bandwidth int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bandwidth_updated_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability text DEFAULT 'offline';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS joined_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skillsets text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dashboard_layout jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Professional Development tables
CREATE TABLE IF NOT EXISTS pd_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text,
  target_date date,
  status text DEFAULT 'Not Started',
  smart_fields jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pd_proof_of_excellence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  description text NOT NULL,
  client_id uuid,
  type text,
  source_link text,
  added_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pd_operating_principles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  principle text NOT NULL,
  quarter text,
  self_rating int,
  self_evidence text,
  manager_rating int,
  manager_notes text,
  review_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pd_call_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  call_date date NOT NULL,
  fathom_url text,
  agenda jsonb,
  summary text,
  action_items jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pd_instant_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  type text,
  content text NOT NULL,
  context text,
  source_type text,
  source_id uuid REFERENCES profiles(id),
  is_repeated boolean DEFAULT false,
  related_feedback_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pd_coaching_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  topic text,
  notes text,
  action_required boolean DEFAULT false,
  call_recording_id uuid,
  visibility text DEFAULT 'manager_only',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pd_review_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  cycle text NOT NULL,
  performance_level text,
  promotion_ready boolean DEFAULT false,
  salary_review_flag boolean DEFAULT false,
  goal_completion_rate numeric,
  poe_count int DEFAULT 0,
  manager_summary text,
  development_plan text,
  completed_at timestamptz
);

-- 3. Client profiles (separate from existing 'clients' table which is DEVICE layer)
CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  company_name text NOT NULL,
  industry text,
  website text,
  social_links jsonb DEFAULT '{}'::jsonb,
  account_lead uuid REFERENCES profiles(id),
  creative_lead uuid REFERENCES profiles(id),
  pr_lead uuid REFERENCES profiles(id),
  brand_tokens jsonb,
  brand_book_url text,
  onboarding_complete boolean DEFAULT false,
  account_health text,
  contract_type text,
  contract_value numeric,
  contract_start date,
  contract_end date,
  scope_watch jsonb DEFAULT '[]'::jsonb,
  notes text,
  md_file_path text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES client_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  email text,
  comms_preference text,
  sensitivities text,
  is_primary boolean DEFAULT false
);

-- 4. Vendor system
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  business_name text,
  mailing_address text,
  scrib3_poc uuid REFERENCES profiles(id),
  work_type text,
  bank_details_submitted boolean DEFAULT false,
  tax_form_type text,
  tax_form_submitted boolean DEFAULT false,
  onboarding_complete boolean DEFAULT false,
  active_projects uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES client_profiles(id),
  project_code text,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'submitted',
  validated_by uuid REFERENCES profiles(id),
  validated_at timestamptz,
  payment_processed boolean DEFAULT false,
  notes text
);

-- 5. Finance
CREATE TABLE IF NOT EXISTS engagement_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES client_profiles(id) ON DELETE CASCADE,
  month date NOT NULL,
  monthly_remit numeric,
  target_margin_pct numeric,
  safety_buffer_pct numeric,
  overhead_pct numeric,
  working_days int,
  team_costs numeric DEFAULT 0,
  vendor_costs numeric DEFAULT 0,
  expense_costs numeric DEFAULT 0,
  profit numeric,
  margin_pct numeric,
  health_status text,
  floor_amount numeric,
  surplus numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bandwidth_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_code text,
  week_of date NOT NULL,
  estimated_hours numeric NOT NULL,
  hourly_rate numeric,
  submitted_at timestamptz DEFAULT now()
);

-- 6. XP levels (xp_events already exists)
CREATE TABLE IF NOT EXISTS xp_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level int UNIQUE NOT NULL,
  name text NOT NULL,
  min_xp int NOT NULL,
  max_xp int NOT NULL,
  badge_emoji text
);

INSERT INTO xp_levels (level, name, min_xp, max_xp, badge_emoji) VALUES
  (1, 'Builder', 0, 99, '🧱'),
  (2, 'Creator', 100, 299, '✏️'),
  (3, 'Contributor', 300, 599, '⚡'),
  (4, 'Veteran', 600, 999, '🔥'),
  (5, 'Legend', 1000, 999999, '⭐')
ON CONFLICT (level) DO NOTHING;

-- 7. Dashboard modules
CREATE TABLE IF NOT EXISTS dashboard_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_type text NOT NULL,
  position jsonb,
  config jsonb,
  is_locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_pd_goals_member ON pd_goals(team_member_id);
CREATE INDEX IF NOT EXISTS idx_pd_poe_member ON pd_proof_of_excellence(team_member_id);
CREATE INDEX IF NOT EXISTS idx_pd_feedback_member ON pd_instant_feedback(team_member_id);
CREATE INDEX IF NOT EXISTS idx_invoices_vendor ON invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_engagement_health_client ON engagement_health(client_id);
CREATE INDEX IF NOT EXISTS idx_bandwidth_member ON bandwidth_estimates(team_member_id);
CREATE INDEX IF NOT EXISTS idx_bandwidth_week ON bandwidth_estimates(week_of);

-- 9. XP trigger (fixed — references xp_events.team_member_id correctly)
CREATE OR REPLACE FUNCTION update_xp_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET xp = (
    SELECT COALESCE(SUM(xp_awarded), 0)
    FROM xp_events
    WHERE team_member_id = NEW.team_member_id
  )
  WHERE id = NEW.team_member_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_xp ON xp_events;
CREATE TRIGGER trigger_update_xp
  AFTER INSERT ON xp_events
  FOR EACH ROW
  EXECUTE FUNCTION update_xp_total();
