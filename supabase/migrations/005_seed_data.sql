-- ===================================================================
-- SCRIB3-OS Seed Data
-- Run in Supabase SQL Editor AFTER 004_fix_schema.sql
-- Seeds: team profiles, clients, projects, vendors, invoices,
--        engagement health, scope watch
-- ===================================================================

-- ===================================================================
-- 1. UPDATE existing auth users with OS fields
-- ===================================================================

-- Ben (admin) — find by email
UPDATE profiles SET
  title = 'VP of Creative', unit = 'Brand', location = 'Portugal',
  timezone = 'Europe/Lisbon', availability = 'available', is_online = true,
  bio = 'Leading creative vision across all SCRIB3 engagements. Obsessed with design systems, brand craft, and making crypto accessible through visual storytelling.',
  skillsets = ARRAY['Brand Strategy', 'Design Systems', 'Creative Direction', 'Web3'],
  social_links = '[{"platform":"Twitter","url":"#"},{"platform":"LinkedIn","url":"#"}]'::jsonb,
  joined_date = '2023-03-01', bandwidth = 85
WHERE email = 'ben.lydiat@scrib3.co';

-- Sixtyne (csuite)
UPDATE profiles SET
  title = 'Chief Creative Officer', unit = 'C-Suite', location = 'Paris, FR',
  timezone = 'Europe/Paris', availability = 'busy', is_online = true,
  bio = 'Overseeing creative output, production workflows, and team culture. Championing operational excellence and financial transparency.',
  skillsets = ARRAY['Creative Leadership', 'Production Management', 'Finance', 'Team Development'],
  social_links = '[{"platform":"LinkedIn","url":"#"}]'::jsonb,
  joined_date = '2022-06-01', bandwidth = 95
WHERE email = 'sixtyne@scrib3.co';

-- Nick (csuite)
UPDATE profiles SET
  title = 'Chief Strategy Officer', unit = 'C-Suite', location = 'USA',
  timezone = 'America/New_York', availability = 'away', is_online = false,
  bio = 'Setting strategic direction for client engagements and internal processes. Focused on alignment, quality standards, and what "good" looks like.',
  skillsets = ARRAY['Strategy', 'Client Relations', 'Process Design', 'Quality Standards'],
  social_links = '[{"platform":"Twitter","url":"#"},{"platform":"LinkedIn","url":"#"}]'::jsonb,
  joined_date = '2022-04-01', bandwidth = 70
WHERE email = 'nick@scrib3.co';

-- CK (team)
UPDATE profiles SET
  title = 'Collaborator / Dev', unit = '—', location = 'USA',
  timezone = 'America/New_York', availability = 'away', is_online = false,
  bio = 'Building SCRIB3-OS. Bridging design and development.',
  skillsets = ARRAY['Development', 'React', 'TypeScript', 'Web3'],
  joined_date = '2025-01-01', bandwidth = 40
WHERE email = 'ck@scrib3.co';

-- ===================================================================
-- 2. SEED CLIENT PROFILES
-- ===================================================================

INSERT INTO client_profiles (slug, company_name, industry, website, social_links, account_health, contract_type, contract_start, scope_watch) VALUES
('cardano', 'Cardano', 'Layer 1 Blockchain', 'cardano.org',
 '{"twitter":"@Cardano","linkedin":"cardano-foundation","discord":"cardano.org/discord"}'::jsonb,
 '🟢', 'Monthly Remit', '2025-06-01',
 '[{"requestType":"Event-specific branded collateral","inScope":false,"sowClause":"SOW §3.2","approvedResponse":"Event collateral falls outside our current retainer scope."},{"requestType":"Discord moderation","inScope":false,"sowClause":"SOW §2.1","approvedResponse":"Community moderation is not part of our current engagement."},{"requestType":"Direct Figma editor access","inScope":false,"sowClause":"SOW §5.1","approvedResponse":"Source files are retained by SCRIB3 per our agreement."}]'::jsonb),

('franklin-templeton', 'Franklin Templeton', 'TradFi / Asset Management', 'franklintempleton.com',
 '{"twitter":"@FTI_US","linkedin":"franklin-templeton"}'::jsonb,
 '🟡', 'Monthly Remit', '2025-09-01',
 '[{"requestType":"24hr compliance turnaround","inScope":true,"sowClause":"SOW §4.3","approvedResponse":"Standard is 48 hours; expedited at additional cost."},{"requestType":"Paid media management","inScope":false,"sowClause":"SOW §2.2","approvedResponse":"Paid media falls outside current scope."}]'::jsonb),

('rootstock', 'Rootstock', 'Bitcoin Sidechain / Smart Contracts', 'rootstock.io',
 '{"twitter":"@rootstock_io","linkedin":"rootstock-labs","discord":"rootstock.io/discord"}'::jsonb,
 '🟢', 'Monthly Remit', '2025-07-01',
 '[{"requestType":"In-person event attendance","inScope":false,"sowClause":"SOW §1.4","approvedResponse":"Remote engagement only; travel scoped separately."},{"requestType":"Unlimited revision rounds","inScope":false,"sowClause":"SOW §3.5","approvedResponse":"2 rounds included; additional billed hourly."}]'::jsonb),

('rome-protocol', 'Rome Protocol', 'Cross-chain Infrastructure', 'rome.io',
 '{"twitter":"@RomeProtocol"}'::jsonb,
 '🟢', 'One Time', '2025-11-01', '[]'::jsonb),

('midnight', 'Midnight', 'Privacy Blockchain / Cardano Ecosystem', 'midnight.network',
 '{"twitter":"@MidnightNtwrk"}'::jsonb,
 '🟢', 'Monthly Remit', '2026-01-01',
 '[{"requestType":"Technical documentation","inScope":false,"sowClause":"SOW §2.3","approvedResponse":"Technical docs excluded; marketing content only."}]'::jsonb),

('canton', 'Canton', 'Enterprise Blockchain / DeFi Infrastructure', 'canton.network',
 '{"twitter":"@canton_network","linkedin":"canton-network"}'::jsonb,
 '🟡', 'Monthly Remit', '2025-08-01',
 '[{"requestType":"Weekend content requests","inScope":false,"sowClause":"SOW §6.1","approvedResponse":"Business hours Mon-Fri; out-of-hours at 1.5x rate."}]'::jsonb);

-- ===================================================================
-- 3. SEED CLIENT CONTACTS
-- ===================================================================

INSERT INTO client_contacts (client_id, name, role, email, comms_preference, is_primary) VALUES
((SELECT id FROM client_profiles WHERE slug = 'cardano'), 'Tim Harrison', 'VP Communications', 'tim@cardanofoundation.org', 'Email + Slack', true),
((SELECT id FROM client_profiles WHERE slug = 'cardano'), 'Maria Chen', 'Content Director', 'maria@cardanofoundation.org', 'Slack', false),
((SELECT id FROM client_profiles WHERE slug = 'franklin-templeton'), 'David Park', 'Digital Assets Marketing', 'david.park@franklintempleton.com', 'Email', true),
((SELECT id FROM client_profiles WHERE slug = 'rootstock'), 'Diego Gutierrez', 'Chief Scientist', 'diego@rootstocklabs.com', 'Slack', true),
((SELECT id FROM client_profiles WHERE slug = 'rootstock'), 'Anna Schmidt', 'Marketing Lead', 'anna@rootstocklabs.com', 'Slack + Email', false),
((SELECT id FROM client_profiles WHERE slug = 'rome-protocol'), 'Marcus Webb', 'Co-Founder', 'marcus@rome.io', 'Telegram', true),
((SELECT id FROM client_profiles WHERE slug = 'midnight'), 'Sarah Jennings', 'Head of Marketing', 'sarah@midnight.network', 'Email', true),
((SELECT id FROM client_profiles WHERE slug = 'canton'), 'Raj Patel', 'Marketing Director', 'raj@canton.network', 'Email', true);

-- ===================================================================
-- 4. SEED VENDOR PROFILES
-- ===================================================================

INSERT INTO vendor_profiles (name, email, business_name, mailing_address, work_type, bank_details_submitted, tax_form_type, tax_form_submitted, onboarding_complete) VALUES
('Tolani Daniel', 'tolani@scrib3.co', 'Tolani Motion Studio', 'Lagos, Nigeria', 'Motion Graphics / Animation', true, 'w8ben-e', true, true),
('Jake Embleton', 'jake@scrib3.co', 'Embleton Creative', 'Manila, Philippines', 'Content / Social', true, 'w8ben-e', true, true),
('Studio Parallax', 'hello@studioparallax.com', 'Studio Parallax LLC', '142 Design Ave, Brooklyn, NY 11201', 'Brand Design', true, 'w9', true, true),
('ChainDev Co', 'ops@chaindev.co', 'ChainDev Co', '88 Blockchain Blvd, Austin, TX 78701', 'Development', true, 'w9', false, false),
('Narrative PR', 'accounts@narrativepr.io', 'Narrative PR Inc', '501 PR Lane, Miami, FL 33101', 'PR', false, null, false, false);

-- ===================================================================
-- 5. SEED INVOICES
-- ===================================================================

INSERT INTO invoices (vendor_id, project_code, line_items, total_amount, currency, submitted_at, status, notes) VALUES
((SELECT id FROM vendor_profiles WHERE email = 'tolani@scrib3.co'), 'CDN-012',
 '[{"description":"Motion graphics — Cardano Q1 campaign","projectCode":"CDN-012","clientName":"Cardano","amount":3500},{"description":"Animation — Rootstock explainer","projectCode":"RSK-003","clientName":"Rootstock","amount":2200}]'::jsonb,
 5700, 'USD', '2026-03-20', 'validated', ''),

((SELECT id FROM vendor_profiles WHERE email = 'jake@scrib3.co'), 'FT-005',
 '[{"description":"Social content — Franklin Templeton March","projectCode":"FT-005","clientName":"Franklin Templeton","amount":4200}]'::jsonb,
 4200, 'USD', '2026-03-22', 'submitted', 'Awaiting Kevin review'),

((SELECT id FROM vendor_profiles WHERE email = 'hello@studioparallax.com'), 'RSK-001',
 '[{"description":"Brand design — Rootstock refresh phase 2","projectCode":"RSK-001","clientName":"Rootstock","amount":8500}]'::jsonb,
 8500, 'USD', '2026-03-15', 'paid', ''),

((SELECT id FROM vendor_profiles WHERE email = 'tolani@scrib3.co'), 'CDN-012',
 '[{"description":"Motion graphics — Cardano Feb batch","projectCode":"CDN-012","clientName":"Cardano","amount":3200}]'::jsonb,
 3200, 'USD', '2026-02-28', 'paid', ''),

((SELECT id FROM vendor_profiles WHERE email = 'jake@scrib3.co'), 'CDN-014',
 '[{"description":"Social content — Cardano March","projectCode":"CDN-014","clientName":"Cardano","amount":2800},{"description":"Social content — Franklin Templeton Feb","projectCode":"FT-005","clientName":"Franklin Templeton","amount":3600}]'::jsonb,
 6400, 'USD', '2026-03-10', 'processing', 'Routed to Camila for payment');

-- ===================================================================
-- 6. SEED ENGAGEMENT HEALTH (monthly data for 6 clients)
-- ===================================================================

-- Cardano ($45K/mo)
INSERT INTO engagement_health (client_id, month, monthly_remit, target_margin_pct, safety_buffer_pct, overhead_pct, working_days, team_costs, vendor_costs, expense_costs, health_status) VALUES
((SELECT id FROM client_profiles WHERE slug = 'cardano'), '2025-10-01', 45000, 35, 10, 15, 22, 18500, 4200, 1800, 'healthy'),
((SELECT id FROM client_profiles WHERE slug = 'cardano'), '2025-11-01', 45000, 35, 10, 15, 22, 19200, 3800, 2100, 'healthy'),
((SELECT id FROM client_profiles WHERE slug = 'cardano'), '2025-12-01', 45000, 35, 10, 15, 22, 17800, 5100, 1500, 'healthy'),
((SELECT id FROM client_profiles WHERE slug = 'cardano'), '2026-01-01', 45000, 35, 10, 15, 22, 20100, 4500, 2200, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'cardano'), '2026-02-01', 45000, 35, 10, 15, 22, 19800, 3900, 1900, 'healthy'),
((SELECT id FROM client_profiles WHERE slug = 'cardano'), '2026-03-01', 45000, 35, 10, 15, 22, 21200, 4800, 2400, 'acceptable');

-- Franklin Templeton ($60K/mo)
INSERT INTO engagement_health (client_id, month, monthly_remit, target_margin_pct, safety_buffer_pct, overhead_pct, working_days, team_costs, vendor_costs, expense_costs, health_status) VALUES
((SELECT id FROM client_profiles WHERE slug = 'franklin-templeton'), '2025-10-01', 60000, 35, 10, 15, 22, 22000, 8500, 3200, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'franklin-templeton'), '2025-11-01', 60000, 35, 10, 15, 22, 24500, 7200, 2800, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'franklin-templeton'), '2025-12-01', 60000, 35, 10, 15, 22, 21800, 9000, 3500, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'franklin-templeton'), '2026-01-01', 60000, 35, 10, 15, 22, 25200, 8100, 2600, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'franklin-templeton'), '2026-02-01', 60000, 35, 10, 15, 22, 23400, 7800, 3100, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'franklin-templeton'), '2026-03-01', 60000, 35, 10, 15, 22, 26100, 8900, 3400, 'break-even');

-- Rootstock ($35K/mo)
INSERT INTO engagement_health (client_id, month, monthly_remit, target_margin_pct, safety_buffer_pct, overhead_pct, working_days, team_costs, vendor_costs, expense_costs, health_status) VALUES
((SELECT id FROM client_profiles WHERE slug = 'rootstock'), '2025-10-01', 35000, 30, 10, 15, 22, 14200, 3500, 1200, 'healthy'),
((SELECT id FROM client_profiles WHERE slug = 'rootstock'), '2025-11-01', 35000, 30, 10, 15, 22, 15100, 2800, 1500, 'healthy'),
((SELECT id FROM client_profiles WHERE slug = 'rootstock'), '2025-12-01', 35000, 30, 10, 15, 22, 13800, 4200, 1100, 'healthy'),
((SELECT id FROM client_profiles WHERE slug = 'rootstock'), '2026-01-01', 35000, 30, 10, 15, 22, 16200, 3100, 1800, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'rootstock'), '2026-02-01', 35000, 30, 10, 15, 22, 14800, 3600, 1400, 'healthy'),
((SELECT id FROM client_profiles WHERE slug = 'rootstock'), '2026-03-01', 35000, 30, 10, 15, 22, 15500, 3800, 1600, 'acceptable');

-- Rome Protocol ($25K/mo)
INSERT INTO engagement_health (client_id, month, monthly_remit, target_margin_pct, safety_buffer_pct, overhead_pct, working_days, team_costs, vendor_costs, expense_costs, health_status) VALUES
((SELECT id FROM client_profiles WHERE slug = 'rome-protocol'), '2025-12-01', 25000, 35, 10, 15, 22, 10200, 2500, 800, 'healthy'),
((SELECT id FROM client_profiles WHERE slug = 'rome-protocol'), '2026-01-01', 25000, 35, 10, 15, 22, 11500, 2800, 1100, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'rome-protocol'), '2026-02-01', 25000, 35, 10, 15, 22, 10800, 3200, 900, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'rome-protocol'), '2026-03-01', 25000, 35, 10, 15, 22, 12100, 2600, 1200, 'acceptable');

-- Midnight ($30K/mo)
INSERT INTO engagement_health (client_id, month, monthly_remit, target_margin_pct, safety_buffer_pct, overhead_pct, working_days, team_costs, vendor_costs, expense_costs, health_status) VALUES
((SELECT id FROM client_profiles WHERE slug = 'midnight'), '2026-01-01', 30000, 30, 10, 15, 22, 12500, 3200, 1500, 'healthy'),
((SELECT id FROM client_profiles WHERE slug = 'midnight'), '2026-02-01', 30000, 30, 10, 15, 22, 13800, 2900, 1200, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'midnight'), '2026-03-01', 30000, 30, 10, 15, 22, 14200, 3500, 1800, 'acceptable');

-- Canton ($20K/mo)
INSERT INTO engagement_health (client_id, month, monthly_remit, target_margin_pct, safety_buffer_pct, overhead_pct, working_days, team_costs, vendor_costs, expense_costs, health_status) VALUES
((SELECT id FROM client_profiles WHERE slug = 'canton'), '2025-10-01', 20000, 30, 10, 15, 22, 9800, 1500, 600, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'canton'), '2025-11-01', 20000, 30, 10, 15, 22, 10200, 1800, 800, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'canton'), '2025-12-01', 20000, 30, 10, 15, 22, 9500, 2100, 500, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'canton'), '2026-01-01', 20000, 30, 10, 15, 22, 11200, 1600, 900, 'break-even'),
((SELECT id FROM client_profiles WHERE slug = 'canton'), '2026-02-01', 20000, 30, 10, 15, 22, 10500, 1900, 700, 'acceptable'),
((SELECT id FROM client_profiles WHERE slug = 'canton'), '2026-03-01', 20000, 30, 10, 15, 22, 11800, 2200, 1100, 'break-even');
