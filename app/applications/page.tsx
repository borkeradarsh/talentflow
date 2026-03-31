'use client';

import { useEffect, useState, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { FileText, Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type StatusFilter = 'all' | 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired';

interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  ai_score?: number;
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
  const [sortByScore, setSortByScore] = useState(false);
  const [scoringApplications, setScoringApplications] = useState<Set<string>>(new Set());

  const scoreApplication = async (applicationId: string) => {
    setScoringApplications(prev => new Set([...prev, applicationId]));
    try {
      const response = await fetch('/api/score-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });
      
      if (response.ok) {
        const { score } = await response.json();
        // Update local state
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...app, ai_score: score } : app
        ));
      } else {
        const error = await response.json();
        console.error('Failed to score application:', error);
        alert(`Failed to score: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('Error scoring application:', error);
      alert('Network error while scoring application');
    } finally {
      setScoringApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

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

  // Sort by AI score if enabled
  const sortedApplications = sortByScore 
    ? [...filteredApplications].sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0))
    : filteredApplications;

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
      <div className="flex justify-between items-start mb-8">
        <div className="animate-slideInLeft">
          <h1 className="text-4xl font-bold text-white">Applications</h1>
          <p className="text-gray-400 mt-2">Track and manage candidate applications</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Object.entries(statusCounts).map(([status, count], idx) => (
          <div
            key={status}
            className="cursor-pointer animate-slideInUp"
            style={{ animationDelay: `${idx * 50}ms` }}
            onClick={() => setFilter(status as StatusFilter)}
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by candidate name or job title..."
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

      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Sort by AI Score:</span>
            <Button
              size="sm"
              variant={sortByScore ? 'primary' : 'ghost'}
              onClick={() => setSortByScore(!sortByScore)}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {sortByScore ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            {sortedApplications.filter(a => a.ai_score).length} of {sortedApplications.length} scored
          </p>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 bg-[#FF7F00] rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-[#0a0a0a] rounded-full"></div>
            </div>
            <p className="text-gray-300">Loading applications...</p>
          </div>
        </div>
      ) : sortedApplications.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-gray-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No applications found</h3>
            <p className="text-gray-400">
              {filter === 'all'
                ? 'Applications will appear here as candidates apply'
                : `No applications with status "${filter}"`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedApplications.map((app, idx) => (
            <Card 
              key={app.id} 
              className="group hover:border-[#FF7F00]/50 transition-all duration-300 animate-slideInUp"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-start lg:items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-[#FF7F00] rounded-full flex items-center justify-center text-white font-semibold shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-orange-900/30">
                    {app.candidates?.full_name?.charAt(0) || 'C'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-lg font-semibold text-white">
                        {app.candidates?.full_name || 'Unknown Candidate'}
                      </h3>
                      <Badge status={app.status as 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired'} />
                      {app.ai_score ? (
                        <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 text-yellow-200 rounded-lg text-xs font-semibold border border-yellow-500/20">
                          {app.ai_score}%
                        </span>
                      ) : !scoringApplications.has(app.id) ? (
                        <button
                          onClick={() => scoreApplication(app.id)}
                          className="px-2.5 py-1 bg-[#1a1a1a] hover:bg-[#262626] text-gray-400 hover:text-[#FF7F00] rounded-lg text-xs font-medium border border-[#262626] hover:border-[#FF7F00]/50 transition-all"
                        >
                          Calculate Score
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 bg-[#1a1a1a] text-gray-500 rounded-lg text-xs">
                          Scoring...
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      Applied for: <span className="font-medium text-gray-200">{app.jobs?.title || 'Unknown Position'}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
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
                            className="px-2.5 py-0.5 bg-[#1a1a1a] text-gray-300 rounded-lg text-xs border border-[#262626] hover:border-[#FF7F00]/50 transition-colors"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-auto lg:ml-4">
                  <Link href={`/candidates/${app.candidate_id}`}>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">View Profile</Button>
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
