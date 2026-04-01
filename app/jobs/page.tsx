'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { supabase, Job } from '@/lib/supabase';
import { Briefcase, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    try {
      const query = supabase.from('jobs').select('*');
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  const statusFilteredJobs = filter === 'all'
    ? jobs
    : jobs.filter(job => job.status === filter);

  const filteredJobs = statusFilteredJobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusCounts = {
    all: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start mb-8 animate-slideInLeft">
        <div>
          <h1 className="text-4xl font-bold text-white">Jobs</h1>
          <p className="text-gray-400 mt-2">Manage all your job postings</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(statusCounts).map(([status, count], idx) => (
          <div
            key={status}
            className="cursor-pointer animate-slideInUp"
            style={{ animationDelay: `${idx * 50}ms` }}
            onClick={() => setFilter(status as 'all' | 'open' | 'closed')}
          >
            <Card
              className={`group transition-all duration-300 ${
                filter === status ? 'ring-2 ring-[#FF7F00] shadow-lg shadow-orange-900/30' : ''
              }`}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{count}</p>
                <p className="text-sm text-gray-400 capitalize mt-2 group-hover:text-gray-300 transition-colors">{status}</p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-[#262626] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7F00] placeholder:text-gray-600 transition-all hover:border-[#404040]"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="transition-all"
            >
              All
            </Button>
            <Button
              variant={filter === 'open' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('open')}
            >
              Open
            </Button>
            <Button
              variant={filter === 'closed' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('closed')}
            >
              Closed
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 bg-[#FF7F00] rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-[#0a0a0a] rounded-full"></div>
            </div>
            <p className="text-gray-300">Loading jobs...</p>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 mx-auto text-gray-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No jobs found</h3>
            <p className="text-gray-400 mb-6">Get started by posting your first job</p>
            <Link href="/jobs/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Post New Job
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, idx) => (
            <Card 
              key={job.id} 
              className="group hover:border-[#FF7F00]/50 transition-all duration-300 animate-slideInUp"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-semibold text-white group-hover:text-[#FF7F00] transition-colors">{job.title}</h3>
                    <Badge status={job.status as 'open' | 'closed'} />
                  </div>
                  <p className="text-gray-300 mb-4 line-clamp-2 group-hover:text-gray-200 transition-colors">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    {job.required_skills && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Skills:</span>
                        <span>{job.required_skills}</span>
                      </div>
                    )}
                    {job.min_experience !== null && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Experience:</span>
                        <span>{job.min_experience}+ years</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Posted:</span>
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 lg:ml-4 shrink-0">
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">View Details</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out;
          opacity: 1;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
          opacity: 1;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
