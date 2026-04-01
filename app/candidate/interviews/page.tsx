'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CandidateSidebar from '@/components/layout/CandidateSidebar';
import CandidateHeader from '@/components/layout/CandidateHeader';
import { Calendar, Clock, Video } from 'lucide-react';

const IST_TIME_ZONE = 'Asia/Kolkata';

function formatIstDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    timeZone: IST_TIME_ZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatIstShortDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    timeZone: IST_TIME_ZONE,
  });
}

function formatIstTime(value: string) {
  return new Date(value).toLocaleTimeString('en-IN', {
    timeZone: IST_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function CandidateInterviewsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [interviews, setInterviews] = useState<{
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    job?: { title: string; description?: string };
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const fetchInterviews = useCallback(async () => {
    try {
      // First get candidate data
      const { data: candidate, error: candidateError} = await supabase
        .from('candidates')
        .select('*')
        .eq('email', user?.email)
        .single();

      if (candidateError && candidateError.code !== 'PGRST116') {
        console.error('Error fetching candidate:', candidateError);
        setLoading(false);
        return;
      }

      setCandidateData(candidate);

      if (candidate) {
        // Then get interviews
        const { data: interviewData, error: interviewError } = await supabase
          .from('interviews')
          .select(`
            *,
            job:jobs(title, description)
          `)
          .eq('candidate_id', candidate.id)
          .order('start_time', { ascending: true });

        if (interviewError) {
          console.error('Error fetching interviews:', interviewError);
        } else {
          setInterviews(interviewData || []);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchInterviews();
    }
  }, [user, authLoading, router, fetchInterviews]);

  const upcomingInterviews = interviews.filter(interview => 
    interview.status === 'scheduled' && new Date(interview.start_time) > new Date()
  );

  const pastInterviews = interviews.filter(interview => 
    interview.status === 'completed' || interview.status === 'cancelled' || 
    (interview.status === 'scheduled' && new Date(interview.start_time) <= new Date())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <CandidateSidebar />
      <CandidateHeader />

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Interviews</h1>
            <p className="text-slate-400">View and manage your scheduled interviews</p>
          </div>

          {!candidateData ? (
            <Card className="border-dashed border-2">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Complete Your Profile First</h3>
                <p className="text-slate-400 mb-6">You need to create a candidate profile to schedule interviews</p>
                <Button variant="primary" onClick={() => router.push('/candidate/profile/edit')}>
                  Create Profile
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Upcoming Interviews</h2>
                {upcomingInterviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingInterviews.map((interview) => (
                      <Card key={interview.id} className="border-blue-500/30 bg-blue-500/5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-xl mb-1">{interview.job?.title}</h3>
                            <Badge status="scheduled" />
                          </div>
                          <Calendar className="w-6 h-6 text-blue-400" />
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span>
                              {formatIstDate(interview.start_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span>
                              {formatIstTime(interview.start_time)} - {formatIstTime(interview.end_time)} IST
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <Button variant="primary" size="sm" className="w-full">
                            <Video className="w-4 h-4 mr-2" />
                            Join Meeting
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2">
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No upcoming interviews</p>
                    </div>
                  </Card>
                )}
              </div>

              {pastInterviews.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Past Interviews</h2>
                  <div className="space-y-4">
                    {pastInterviews.map((interview) => (
                      <Card key={interview.id} className="opacity-75">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{interview.job?.title}</h3>
                              <Badge status={interview.status as 'scheduled' | 'completed' | 'cancelled'} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatIstShortDate(interview.start_time)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatIstTime(interview.start_time)} IST
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
