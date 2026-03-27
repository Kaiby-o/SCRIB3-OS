-- Fix avatar URLs for case-sensitive filenames
UPDATE profiles SET avatar_url = 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/destini.png' WHERE email = 'destini@scrib3.co';
UPDATE profiles SET avatar_url = 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Avatars/kim.png' WHERE email = 'kim@scrib3.co';
