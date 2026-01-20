'use client';

import { useEffect, useState, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { FileText, Search, Filter } from 'lucide-react';
import Link from 'next/link';

type StatusFilter = 'all' | 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired';

interface Application {
  id: string;
  candidate_id: string;
  status: string;
  applied_at: string;
  candidates?: {
    full_name?: string;
    email?: string;
    skills?: string;
    experience_years?: number;
  };
  jobs?: {
    title?: string;
    status?: string;
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('applications')
        .select(`
          *,
          candidates (full_name, email, skills, experience_years),
          jobs (title, status)
        `);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query.order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = applications.filter(app =>
    app.candidates?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusCounts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    hired: applications.filter(a => a.status === 'hired').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="animate-slideInLeft">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Applications</h1>
          <p className="text-slate-400 mt-2">Track and manage candidate applications</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count], idx) => (
          <div
            key={status}
            className="cursor-pointer animate-slideInUp"
            style={{ animationDelay: `${idx * 50}ms` }}
            onClick={() => setFilter(status as StatusFilter)}
          >
            <Card
              className={`group transition-all duration-300 ${
                filter === status ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : ''
              }`}
            >
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">{count}</p>
                <p className="text-sm text-slate-400 capitalize mt-2 group-hover:text-slate-300 transition-colors">{status}</p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 transition-all hover:border-slate-500"
            />
          </div>

          {/* Status Filters */}
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
              variant={filter === 'applied' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('applied')}
            >
              Applied
            </Button>
            <Button
              variant={filter === 'shortlisted' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('shortlisted')}
            >
              Shortlisted
            </Button>
            <Button
              variant={filter === 'interview' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('interview')}
            >
              Interview
            </Button>
          </div>
        </div>
      </Card>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-slate-800 rounded-full"></div>
            </div>
            <p className="text-slate-300">Loading applications...</p>
          </div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No applications found</h3>
            <p className="text-slate-400">
              {filter === 'all'
                ? 'Applications will appear here as candidates apply'
                : `No applications with status "${filter}"`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app, idx) => (
            <Card 
              key={app.id} 
              className="group hover:border-blue-400/50 transition-all duration-300 animate-slideInUp"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-start lg:items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold shrink-0 group-hover:scale-110 transition-transform">
                    {app.candidates?.full_name?.charAt(0) || 'C'}
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-lg font-semibold text-slate-100">
                        {app.candidates?.full_name || 'Unknown Candidate'}
                      </h3>
                      <Badge status={app.status as 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired'} />
                    </div>
                    <p className="text-sm text-slate-400 mb-2">
                      Applied for: <span className="font-medium text-slate-200">{app.jobs?.title || 'Unknown Position'}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                      {app.candidates?.email && (
                        <span>{app.candidates.email}</span>
                      )}
                      {app.candidates?.experience_years !== null && app.candidates?.experience_years !== undefined && (
                        <span>{app.candidates.experience_years} years exp.</span>
                      )}
                      <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>

                    {app.candidates?.skills && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {app.candidates.skills.split(',').slice(0, 4).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-slate-700/50 text-slate-300 rounded-lg text-xs border border-slate-600 hover:border-blue-500/50 transition-colors"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-auto lg:ml-4">
                  <Link href={`/candidates/${app.candidate_id}`}>
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-blue-300">View Profile</Button>
                  </Link>
                  <Link href={`/applications/${app.id}`}>
                    <Button size="sm">Review</Button>
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
