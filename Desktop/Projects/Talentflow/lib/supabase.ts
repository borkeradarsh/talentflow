import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on your schema
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'recruiter' | 'candidate';
  created_at: string;
};

export type Job = {
  id: string;
  created_by: string;
  title: string;
  description: string;
  required_skills: string;
  min_experience: number;
  status: 'open' | 'closed';
  created_at: string;
};

export type Candidate = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  education: string;
  experience_years: number;
  skills: string;
  resume_url: string;
  resume_score?: number;
  created_at: string;
};

export type Application = {
  id: string;
  candidate_id: string;
  job_id: string;
  status: 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired';
  ai_score?: number;
  applied_at: string;
};

export type Interview = {
  id: string;
  candidate_id: string;
  job_id: string;
  start_time: string;
  end_time: string;
  google_event_id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
};
