'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CandidateSidebar from '@/components/layout/CandidateSidebar';
import CandidateHeader from '@/components/layout/CandidateHeader';
import { User, Mail, Phone, Briefcase, GraduationCap, FileText, Plus, Upload, Award, Clock, TrendingUp, CheckCircle } from 'lucide-react';

export default function CandidateProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [candidateData, setCandidateData] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [scoringResume, setScoringResume] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchCandidateData();
    }
  }, [user, authLoading, router]);

  const fetchCandidateData = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('email', user?.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching candidate:', error);
      } else {
        setCandidateData(data);
        if (data?.resume_score) {
          setResumeScore(data.resume_score);
        } else if (data?.id) {
          // Score resume if not already scored
          scoreResume(data.id);
        }
        if (data?.id) {
          fetchApplications(data.id);
        } else {
          setApplications([]);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const scoreResume = async (candidateId: string) => {
    setScoringResume(true);
    try {
      const response = await fetch('/api/score-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });

      if (response.ok) {
        const { score } = await response.json();
        setResumeScore(score);
      }
    } catch (error) {
      console.error('Error scoring resume:', error);
    } finally {
      setScoringResume(false);
    }
  };

  const fetchApplications = async (candidateId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(title, description, status)
        `)
        .eq('candidate_id', candidateId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
      } else {
        setApplications(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired': return 'bg-green-500/10 text-green-400 border-green-500/50';
      case 'interview': return 'bg-blue-500/10 text-blue-400 border-blue-500/50';
      case 'shortlisted': return 'bg-purple-500/10 text-purple-400 border-purple-500/50';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <CandidateSidebar />
      <CandidateHeader />

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6 relative z-10">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-linear-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Applications</p>
                  <p className="text-3xl font-bold text-blue-400">{applications.length}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-400/50" />
              </div>
            </Card>

            <Card className="bg-linear-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Interviews</p>
                  <p className="text-3xl font-bold text-purple-400">{applications.filter(a => a.status === 'interview').length}</p>
                </div>
                <Clock className="w-10 h-10 text-purple-400/50" />
              </div>
            </Card>

            <Card className="bg-linear-to-br from-green-500/10 to-green-600/10 border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Shortlisted</p>
                  <p className="text-3xl font-bold text-green-400">{applications.filter(a => a.status === 'shortlisted').length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400/50" />
              </div>
            </Card>

            <Card className="bg-linear-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Profile Score</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {scoringResume ? '...' : resumeScore ? `${resumeScore}%` : candidateData ? '0%' : '0%'}
                  </p>
                </div>
                <Award className="w-10 h-10 text-yellow-400/50" />
              </div>
            </Card>
          </div>

          {/* Profile Section */}
          <Card className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-linear-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-xl">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">{candidateData?.full_name || user?.user_metadata?.name || 'Complete Your Profile'}</h2>
                  <p className="text-slate-400 flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                  {candidateData && (
                    <Badge variant="success" className="flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" />
                      Profile Active
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="primary" onClick={() => router.push('/candidate/profile/edit')}>
                {candidateData ? 'Edit Profile' : 'Complete Profile'}
              </Button>
            </div>

            {candidateData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Phone</p>
                      <p className="font-medium text-white">{candidateData.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Experience</p>
                      <p className="font-medium text-white">{candidateData.experience_years || 0} years</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Education</p>
                      <p className="font-medium text-white">{candidateData.education || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Resume</p>
                      <p className="font-medium text-white">{candidateData.resume_url ? 'Uploaded' : 'Not uploaded'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-blue-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {candidateData.skills?.split(',').map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300">
                            {skill.trim()}
                          </Badge>
                        )) || <span className="text-slate-500">No skills listed</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {candidateData.resume_url && (
                  <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="font-medium text-white">Resume Uploaded</p>
                        <p className="text-sm text-slate-400">Your resume is ready for applications</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(candidateData.resume_url, '_blank')}>
                      View
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-600 rounded-lg">
                <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Add your information, skills, and resume to start applying for jobs and get discovered by recruiters
                </p>
                <Button variant="primary" onClick={() => router.push('/candidate/profile/edit')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Profile
                </Button>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="hover:border-blue-500/50 transition-all cursor-pointer group"
                onClick={() => router.push('/candidate/jobs')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Briefcase className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Browse Jobs</h3>
                    <p className="text-sm text-slate-400">Find your next opportunity</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="hover:border-purple-500/50 transition-all cursor-pointer group"
                onClick={() => router.push('/candidate/applications')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">My Applications</h3>
                    <p className="text-sm text-slate-400">Track your progress</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="hover:border-green-500/50 transition-all cursor-pointer group"
                onClick={() => router.push('/candidate/profile/edit')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <Upload className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Update Resume</h3>
                    <p className="text-sm text-slate-400">Keep profile current</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Recent Applications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Applications</h2>
              {applications.length > 3 && (
                <Button variant="outline" size="sm" onClick={() => router.push('/candidate/applications')}>
                  View All
                </Button>
              )}
            </div>
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 3).map((app) => (
                  <Card key={app.id} className="hover:border-blue-500/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-white mb-1">{app.job?.title}</h3>
                            <p className="text-slate-400 text-sm flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Applied {new Date(app.applied_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Badge>
                        </div>
                        {app.job?.description && (
                          <p className="text-slate-400 text-sm line-clamp-2 mb-3">{app.job.description}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Start your job search journey by browsing available positions and applying to roles that match your skills
                  </p>
                  <Button variant="primary" onClick={() => router.push('/candidate/jobs')}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
