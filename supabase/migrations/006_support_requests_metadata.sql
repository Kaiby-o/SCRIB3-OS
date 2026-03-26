-- Add metadata column to support_requests for contact form data
ALTER TABLE support_requests ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
