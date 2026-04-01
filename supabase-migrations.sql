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

-- Add recruiter review fields to interviews table
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS recruiter_rating INTEGER CHECK (recruiter_rating >= 1 AND recruiter_rating <= 5),
ADD COLUMN IF NOT EXISTS recruiter_feedback TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_interviews_reviewed_at ON interviews(reviewed_at);

COMMENT ON COLUMN interviews.recruiter_rating IS 'Recruiter rating for completed interview (1-5)';
COMMENT ON COLUMN interviews.recruiter_feedback IS 'Recruiter feedback notes for completed interview';
COMMENT ON COLUMN interviews.reviewed_at IS 'Timestamp when recruiter review was submitted';
