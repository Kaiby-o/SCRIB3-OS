-- ===================================================================
-- RLS Policies for all OS tables
-- Run in Supabase SQL Editor
-- Policy: authenticated users can read all, write own data
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE bandwidth_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_proof_of_excellence ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_operating_principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_instant_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_coaching_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pd_review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_modules ENABLE ROW LEVEL SECURITY;

-- Read policies — all authenticated users can read
CREATE POLICY "Auth read client_profiles" ON client_profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read client_contacts" ON client_contacts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read vendor_profiles" ON vendor_profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read invoices" ON invoices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read engagement_health" ON engagement_health FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read bandwidth_estimates" ON bandwidth_estimates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read pd_goals" ON pd_goals FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read pd_proof_of_excellence" ON pd_proof_of_excellence FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read pd_operating_principles" ON pd_operating_principles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read pd_instant_feedback" ON pd_instant_feedback FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read pd_call_recordings" ON pd_call_recordings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read pd_coaching_notes" ON pd_coaching_notes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read pd_review_cycles" ON pd_review_cycles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read xp_events" ON xp_events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth read xp_levels" ON xp_levels FOR SELECT USING (true); -- public read
CREATE POLICY "Auth read dashboard_modules" ON dashboard_modules FOR SELECT USING (auth.uid() = user_id);

-- Write policies — authenticated users can insert
CREATE POLICY "Auth insert client_profiles" ON client_profiles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert client_contacts" ON client_contacts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert vendor_profiles" ON vendor_profiles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert engagement_health" ON engagement_health FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert bandwidth_estimates" ON bandwidth_estimates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert pd_goals" ON pd_goals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert pd_proof_of_excellence" ON pd_proof_of_excellence FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert pd_operating_principles" ON pd_operating_principles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert pd_instant_feedback" ON pd_instant_feedback FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert pd_call_recordings" ON pd_call_recordings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert xp_events" ON xp_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert dashboard_modules" ON dashboard_modules FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update policies — authenticated users can update
CREATE POLICY "Auth update client_profiles" ON client_profiles FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update vendor_profiles" ON vendor_profiles FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update invoices" ON invoices FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update bandwidth_estimates" ON bandwidth_estimates FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update pd_goals" ON pd_goals FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update pd_proof_of_excellence" ON pd_proof_of_excellence FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update dashboard_modules" ON dashboard_modules FOR UPDATE USING (auth.uid() = user_id);
