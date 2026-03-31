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
import { Briefcase, Clock, TrendingUp, Building2, MapPin, DollarSign, Search } from 'lucide-react';

export default function CandidateJobsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchJobs();
    }
  }, [user, authLoading, router]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
      } else {
        setJobs(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.required_skills.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
            <p className="text-slate-400">Find your next career opportunity</p>
          </div>

          <Card className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by job title, skills, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-slate-500"
              />
            </div>
          </Card>

          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'} available
            </p>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:border-blue-500/50 transition-all group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 group-hover:border-blue-500/50 transition-colors">
                      <Briefcase className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-1 text-white group-hover:text-blue-300 transition-colors">{job.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{job.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>{job.min_experience}+ years experience required</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-slate-300">
                      <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-slate-400 text-xs mb-1">Required Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.required_skills.split(',').slice(0, 4).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300 text-xs">
                              {skill.trim()}
                            </Badge>
                          ))}
                          {job.required_skills.split(',').length > 4 && (
                            <Badge variant="outline" className="bg-slate-500/10 border-slate-500/30 text-slate-400 text-xs">
                              +{job.required_skills.split(',').length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                      {job.status === 'open' ? 'Actively Hiring' : 'Closed'}
                    </Badge>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => router.push(`/candidate/jobs/${job.id}`)}
                      disabled={job.status !== 'open'}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No Jobs Found' : 'No Open Positions'}
                </h3>
                <p className="text-slate-400 mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search terms or browse all available positions'
                    : 'Check back later for new opportunities'
                  }
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
