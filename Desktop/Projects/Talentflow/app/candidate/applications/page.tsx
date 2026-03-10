'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CandidateSidebar from '@/components/layout/CandidateSidebar';
import CandidateHeader from '@/components/layout/CandidateHeader';
import { FileText, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle, Calendar } from 'lucide-react';

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Array<{
    id: string;
    status: string;
    applied_at: string;
    job?: {
      title?: string;
      description?: string;
      status?: string;
      required_skills?: string;
      min_experience?: number;
    } | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState<{
    id: string;
    full_name?: string;
    email?: string;
    phone?: string;
    education?: string;
    experience_years?: number;
    skills?: string;
    resume_url?: string;
  } | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const fetchCandidateAndApplications = useCallback(async () => {
    try {
      // First get candidate data
      const { data: candidate, error: candidateError } = await supabase
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
        // Then get applications
        const { data: apps, error: appsError } = await supabase
          .from('applications')
          .select(`
            *,
            job:jobs(title, description, status, required_skills, min_experience)
          `)
          .eq('candidate_id', candidate.id)
          .order('applied_at', { ascending: false });

        if (appsError) {
          console.error('Error fetching applications:', appsError);
        } else {
          setApplications(apps || []);
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
      fetchCandidateAndApplications();
    }
  }, [user, authLoading, router, fetchCandidateAndApplications]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hired': return <CheckCircle className="w-5 h-5" />;
      case 'interview': return <Calendar className="w-5 h-5" />;
      case 'shortlisted': return <TrendingUp className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired': return 'bg-green-500/10 text-green-400 border-green-500/50';
      case 'interview': return 'bg-blue-500/10 text-blue-400 border-blue-500/50';
      case 'shortlisted': return 'bg-purple-500/10 text-purple-400 border-purple-500/50';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/50';
    }
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Applications</h1>
            <p className="text-slate-400">Track the status of your job applications</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-slate-700/30">
              <p className="text-sm text-slate-400 mb-1">Total</p>
              <p className="text-2xl font-bold">{applications.length}</p>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/30">
              <p className="text-sm text-slate-400 mb-1">Interviews</p>
              <p className="text-2xl font-bold text-blue-400">{applications.filter(a => a.status === 'interview').length}</p>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <p className="text-sm text-slate-400 mb-1">Shortlisted</p>
              <p className="text-2xl font-bold text-purple-400">{applications.filter(a => a.status === 'shortlisted').length}</p>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <p className="text-sm text-slate-400 mb-1">Hired</p>
              <p className="text-2xl font-bold text-green-400">{applications.filter(a => a.status === 'hired').length}</p>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <p className="text-sm text-slate-400 mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{applications.filter(a => a.status === 'rejected').length}</p>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'applied', 'shortlisted', 'interview', 'hired', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
                className="whitespace-nowrap"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {/* Applications List */}
          {!candidateData ? (
            <Card className="border-dashed border-2">
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Complete Your Profile First</h3>
                <p className="text-slate-400 mb-6">You need to create a candidate profile before applying to jobs</p>
                <Button variant="primary" onClick={() => router.push('/candidate/profile/edit')}>
                  Create Profile
                </Button>
              </div>
            </Card>
          ) : filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <Card key={app.id} className="hover:border-blue-500/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-xl text-white mb-1">{app.job?.title}</h3>
                          <p className="text-slate-400 text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Applied {new Date(app.applied_at).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <Badge className={`flex items-center gap-2 ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {app.job?.description && (
                        <p className="text-slate-300 text-sm mb-3 line-clamp-2">{app.job.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {app.job?.required_skills && (
                          <span>Skills: {app.job.required_skills}</span>
                        )}
                        {app.job?.min_experience && (
                          <span>• {app.job.min_experience}+ years exp.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filter === 'all' ? 'No Applications Yet' : `No ${filter} Applications`}
                </h3>
                <p className="text-slate-400 mb-6">
                  {filter === 'all' 
                    ? 'Start applying to jobs that match your skills and experience'
                    : `You don't have any applications in ${filter} status`
                  }
                </p>
                <Button variant="primary" onClick={() => router.push('/candidate/jobs')}>
                  Browse Jobs
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
