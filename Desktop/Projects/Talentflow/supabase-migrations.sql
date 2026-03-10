-- Add AI scoring columns to database tables
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Add resume_score column to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS resume_score INTEGER CHECK (resume_score >= 0 AND resume_score <= 100);

-- Add ai_score column to applications table  
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_candidates_resume_score ON candidates(resume_score);
CREATE INDEX IF NOT EXISTS idx_applications_ai_score ON applications(ai_score);

-- Add comments for documentation
COMMENT ON COLUMN candidates.resume_score IS 'AI-generated ATS resume score (0-100)';
COMMENT ON COLUMN applications.ai_score IS 'AI-generated job-specific match score (0-100)';
