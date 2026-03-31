'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CandidateSidebar from '@/components/layout/CandidateSidebar';
import CandidateHeader from '@/components/layout/CandidateHeader';
import { Briefcase, Clock, Award, CheckCircle, ArrowLeft, Send } from 'lucide-react';

export default function CandidateJobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<{
    id: string;
    title: string;
    description: string;
    requirements?: string;
    salary_range?: string;
    location?: string;
    type?: string;
    status?: string;
    required_skills?: string;
    min_experience?: number;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [candidateData, setCandidateData] = useState<{
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    skills?: string;
    resume_url?: string;
  } | null>(null);

  const fetchJobAndApplicationStatus = useCallback(async () => {
    try {
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // Fetch candidate data
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('*')
        .eq('email', user?.email)
        .single();

      if (candidateError && candidateError.code !== 'PGRST116') {
        console.error('Error fetching candidate:', candidateError);
      } else {
        setCandidateData(candidate);

        // Check if already applied
        if (candidate) {
          const { data: applicationData } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', params.id)
            .eq('candidate_id', candidate.id)
            .single();

          setHasApplied(!!applicationData);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id, user?.email]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && params.id) {
      fetchJobAndApplicationStatus();
    }
  }, [user, authLoading, router, params.id, fetchJobAndApplicationStatus]);

  const handleApply = async () => {
    if (!job) {
      alert('Job details not available');
      return;
    }

    if (!candidateData) {
      alert('Please complete your profile before applying to jobs');
      router.push('/candidate/profile/edit');
      return;
    }

    setApplying(true);

    try {
      const { error } = await supabase
        .from('applications')
        .insert([{
          job_id: job.id,
          candidate_id: candidateData.id,
          status: 'applied',
          applied_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setHasApplied(true);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <CandidateSidebar />
        <CandidateHeader />
        <main className="ml-64 pt-16 min-h-screen flex items-center justify-center">
          <Card>
            <p className="text-slate-400">Job not found</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <CandidateSidebar />
      <CandidateHeader />

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => router.push('/candidate/jobs')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  {job.status && <Badge status={job.status as 'open' | 'closed'} />}
                </div>
                {job.status === 'open' && !hasApplied && (
                  <Button
                    variant="primary"
                    onClick={handleApply}
                    disabled={applying}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {applying ? 'Submitting...' : 'Apply Now'}
                  </Button>
                )}
                {hasApplied && (
                  <Badge variant="success" className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Applied
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h2 className="text-xl font-bold mb-4">Job Description</h2>
                <p className="text-slate-300 whitespace-pre-wrap">{job.description}</p>
              </Card>

              <Card>
                <h2 className="text-xl font-bold mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills?.split(',').map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold mb-4">Job Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400">Experience Required</p>
                      <p className="font-medium text-white">{job.min_experience}+ years</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400">Job Type</p>
                      <p className="font-medium text-white">Full-time</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400">Status</p>
                      <p className="font-medium text-white capitalize">{job.status}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {!candidateData && (
                <Card className="border-yellow-500/30 bg-yellow-500/5">
                  <p className="text-sm text-yellow-300 mb-3">Complete your profile to apply</p>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/candidate/profile/edit')}>
                    Complete Profile
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
