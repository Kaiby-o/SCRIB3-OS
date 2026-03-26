-- ===================================================================
-- Create profile rows for all 25 remaining team members
-- They'll need auth accounts created separately (via invite or signup)
-- For now this creates the profile data so it's ready when they log in
-- ===================================================================

INSERT INTO profiles (id, display_name, email, role, title, unit, location, timezone, availability, is_online, bio, skillsets, joined_date, xp, bandwidth, avatar_url) VALUES
(gen_random_uuid(), 'JB', 'jb@scrib3.co', 'csuite', 'Chief Executive Officer', 'C-Suite', 'Chicago, USA', 'America/Chicago', 'away', false, '', ARRAY['Leadership', 'Business Development', 'Web3'], '2021-01-01', 500, 40, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/JB.png'),

(gen_random_uuid(), 'Ross Booth', 'ross@scrib3.co', 'csuite', 'Co-Founder', 'C-Suite', 'USA', 'America/New_York', 'offline', false, '', ARRAY['Business Development', 'Partnerships'], '2021-01-01', 400, 20, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Ross_Booth.jpg'),

(gen_random_uuid(), 'Arthur Stern', 'arthur@scrib3.co', 'csuite', 'Co-Founder / COO', 'C-Suite', 'USA', 'America/New_York', 'offline', false, '', ARRAY['Operations', 'Finance', 'Partnerships'], '2021-01-01', 400, 25, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Arthur_Stern.png'),

(gen_random_uuid(), 'Ishan Bhaidani', 'ishan@scrib3.co', 'csuite', 'Co-Founder', 'C-Suite', 'USA', 'America/New_York', 'offline', false, '', ARRAY['Technology', 'Web3', 'Product'], '2021-01-01', 350, 15, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Ishan_Bhaidani.png'),

(gen_random_uuid(), 'Elena Zheng', 'elena@scrib3.co', 'team', 'Senior Account Lead', 'Accounts', 'USA', 'America/New_York', 'available', true, 'Managing SCRIB3''s largest client relationships. Ensuring alignment between client goals and creative output.', ARRAY['Account Management', 'Client Relations', 'Strategy', 'Project Management'], '2023-06-01', 620, 85, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Elena_Zheng.jpg'),

(gen_random_uuid(), 'Omar Anwar', 'omar@scrib3.co', 'team', 'Account Lead', 'Accounts', 'UK', 'Europe/London', 'available', true, 'Leading the Rootstock and Midnight accounts. Focused on clear communication and proactive client management.', ARRAY['Account Management', 'Client Relations', 'Web3'], '2024-01-15', 480, 75, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Omar_Anwar.jpg'),

(gen_random_uuid(), 'Haley Stewart Torculas', 'haley@scrib3.co', 'team', 'People & Operations', 'Ops', 'USA', 'America/New_York', 'available', true, 'Running people operations, onboarding, and team culture initiatives.', ARRAY['HR', 'Operations', 'Onboarding', 'Culture'], '2023-09-01', 310, 60, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Haley_Stewart_Torculas.jpg'),

(gen_random_uuid(), 'Camila', 'camila@scrib3.co', 'team', 'Operations — Invoicing POC', 'Ops', 'USA', 'America/New_York', 'available', true, 'Processing vendor invoices and managing payment workflows.', ARRAY['Finance', 'Invoicing', 'Operations'], '2024-06-01', 180, 55, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Camila.jpg'),

(gen_random_uuid(), 'Matthew Brannon', 'matt@scrib3.co', 'team', 'PR Lead', 'PR', 'USA', 'America/New_York', 'busy', true, 'Leading PR strategy and media relations across all client engagements.', ARRAY['PR Strategy', 'Media Relations', 'Crisis Comms', 'Web3 PR'], '2023-04-01', 540, 80, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Matthew_Brannon.png'),

(gen_random_uuid(), 'Jenny', 'jenny@scrib3.co', 'team', 'PR / Broadcast', 'PR', 'USA', 'America/New_York', 'away', false, '', ARRAY['PR', 'Broadcast', 'Media'], '2024-02-01', 220, 65, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Jenny.png'),

(gen_random_uuid(), 'Destini', 'destini@scrib3.co', 'team', 'PR', 'PR', 'USA', 'America/New_York', 'offline', false, '', ARRAY['PR', 'Media Relations'], '2024-03-01', 190, 50, NULL),

(gen_random_uuid(), 'Janelle', 'janelle@scrib3.co', 'team', 'PR', 'PR', 'USA', 'America/New_York', 'offline', false, '', ARRAY['PR', 'Content'], '2024-05-01', 160, 45, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Janelle.png'),

(gen_random_uuid(), 'Hugh', 'hugh@scrib3.co', 'team', 'PR / Podcasts', 'PR', 'USA', 'America/New_York', 'away', false, '', ARRAY['PR', 'Podcasts', 'Audio'], '2024-01-01', 280, 70, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Hugh.png'),

(gen_random_uuid(), 'Kevin Moran', 'kevin@scrib3.co', 'team', 'Brand Designer', 'Brand', 'USA', 'America/New_York', 'busy', true, 'Designing brand systems and visual identities for SCRIB3 clients. Pixel-perfect execution with strategic intent.', ARRAY['Brand Design', 'Visual Identity', 'Typography', 'Figma'], '2023-07-01', 580, 90, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Kevin_Moran.jpg'),

(gen_random_uuid(), 'Kevin Arteaga', 'kevin.arteaga@scrib3.co', 'team', 'PR Account Manager', 'PR', 'USA', 'America/New_York', 'available', true, '', ARRAY['PR', 'Account Management'], '2024-08-01', 140, 60, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Kevin_Arteaga.png'),

(gen_random_uuid(), 'Samantha Kelly', 'sam@scrib3.co', 'team', 'Brand Strategy / Creative', 'Brand', 'USA', 'America/New_York', 'busy', true, 'Bridging strategy and creative execution. Ensuring every deliverable ladders up to the client''s strategic goals.', ARRAY['Brand Strategy', 'Creative Direction', 'Content Strategy', 'Web3'], '2023-05-01', 650, 95, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Samantha_Kelly.jpg'),

(gen_random_uuid(), 'Cynthia Gentry', 'cynthia@scrib3.co', 'team', 'Creative Copywriter', 'Brand', 'USA', 'America/New_York', 'available', true, 'Crafting copy that converts. Specializing in Web3 messaging and brand voice development.', ARRAY['Copywriting', 'Brand Voice', 'Content Strategy', 'Web3'], '2023-11-01', 420, 95, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Cynthia_Gentry.jpg'),

(gen_random_uuid(), 'Amanda Eyer', 'amanda@scrib3.co', 'team', 'Creative', 'Brand', 'Brazil', 'America/Sao_Paulo', 'away', false, '', ARRAY['Design', 'Creative', 'Illustration'], '2024-04-01', 240, 55, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Amanda_Eyer.jpg'),

(gen_random_uuid(), 'Jake Embleton', 'jake@scrib3.co', 'team', 'Content / Social', 'Brand', 'Philippines', 'Asia/Manila', 'away', false, 'Creating social content that drives engagement in the Web3 space.', ARRAY['Social Media', 'Content Creation', 'Community', 'Web3'], '2024-02-15', 340, 90, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Jake_Embleton.png'),

(gen_random_uuid(), 'Stef Luthin', 'stef@scrib3.co', 'team', 'Content', 'Brand', 'USA', 'America/New_York', 'available', true, '', ARRAY['Content', 'Writing', 'Research'], '2024-06-01', 200, 50, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Stefanie.png'),

(gen_random_uuid(), 'Luke', 'luke@scrib3.co', 'team', 'Content / Social', 'Brand', 'USA', 'America/New_York', 'offline', false, '', ARRAY['Content', 'Social Media'], '2024-07-01', 150, 45, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Luke_Bateman.png'),

(gen_random_uuid(), 'Tolani Daniel', 'tolani@scrib3.co', 'team', 'Motion Graphic Designer', 'Brand', 'Nigeria', 'Africa/Lagos', 'busy', true, 'Bringing brand stories to life through motion. Specializing in explainer animations and social motion content.', ARRAY['Motion Graphics', 'Animation', 'After Effects', 'Cinema 4D'], '2023-08-01', 510, 95, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Tolani_Daniel.jpg'),

(gen_random_uuid(), 'Taylor Hadden', 'taylor@scrib3.co', 'team', '—', 'Brand', 'USA', 'America/New_York', 'offline', false, '', ARRAY['Brand'], '2024-09-01', 80, 30, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Taylor_Hadden.png'),

(gen_random_uuid(), 'Madisen', 'madisen@scrib3.co', 'team', 'Account Manager', 'Accounts', 'USA', 'America/New_York', 'available', true, '', ARRAY['Account Management', 'Client Relations'], '2024-10-01', 120, 55, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Madisen_Kopfer.jpg'),

(gen_random_uuid(), 'Kim', 'kim@scrib3.co', 'team', 'Account Manager', 'Accounts', 'Dubai', 'Asia/Dubai', 'away', false, '', ARRAY['Account Management', 'MENA Markets'], '2024-11-01', 100, 50, 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Kim.jpg');
