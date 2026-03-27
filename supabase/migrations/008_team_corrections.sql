-- Update team member roles, titles, and units to match latest corrections
-- Run in Supabase SQL Editor

-- CK → csuite
UPDATE profiles SET role = 'csuite', unit = 'C-Suite' WHERE email = 'ck@scrib3.co';

-- Kim → PR team, Senior PR Account Manager
UPDATE profiles SET title = 'Senior PR Account Manager', unit = 'PR', skillsets = ARRAY['PR', 'Account Management', 'MENA Markets'] WHERE email = 'kim@scrib3.co';

-- Madisen → PR team, PR Account Manager
UPDATE profiles SET title = 'PR Account Manager', unit = 'PR', skillsets = ARRAY['PR', 'Account Management'] WHERE email = 'madisen@scrib3.co';

-- Taylor → PR team, PR Account Manager
UPDATE profiles SET title = 'PR Account Manager', unit = 'PR', skillsets = ARRAY['PR', 'Account Management'] WHERE email = 'taylor@scrib3.co';

-- Janelle → VP of PR
UPDATE profiles SET title = 'VP of PR', skillsets = ARRAY['PR', 'Leadership', 'Content'] WHERE email = 'janelle@scrib3.co';

-- Camila → remove 'Invoicing POC' from title
UPDATE profiles SET title = 'Operations' WHERE email = 'camila@scrib3.co';

-- Elena → VP of Accounts
UPDATE profiles SET title = 'VP of Accounts' WHERE email = 'elena@scrib3.co';

-- Destini → update avatar to new picture (you replaced in bucket)
UPDATE profiles SET avatar_url = 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/Destini.png' WHERE email = 'destini@scrib3.co';
