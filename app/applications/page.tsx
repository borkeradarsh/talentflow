'use client';

import { useEffect, useState, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { FileText, Search } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">Track and manage candidate applications</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className="cursor-pointer"
            onClick={() => setFilter(status as StatusFilter)}
          >
            <Card
              className={`transition-all ${
                filter === status ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600 capitalize mt-1">{status}</p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by candidate name or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'Applications will appear here as candidates apply'
                : `No applications with status "${filter}"`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                    {app.candidates?.full_name?.charAt(0) || 'C'}
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {app.candidates?.full_name || 'Unknown Candidate'}
                      </h3>
                      <Badge status={app.status as 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'hired'} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Applied for: <span className="font-medium text-gray-900">{app.jobs?.title || 'Unknown Position'}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {app.candidates?.email && (
                        <span>{app.candidates.email}</span>
                      )}
                      {app.candidates?.experience_years !== null && app.candidates?.experience_years !== undefined && (
                        <span>{app.candidates.experience_years} years exp.</span>
                      )}
                      <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                    </div>

                    {app.candidates?.skills && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {app.candidates.skills.split(',').slice(0, 4).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <Link href={`/candidates/${app.candidate_id}`}>
                    <Button variant="ghost" size="sm">View Profile</Button>
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
    </div>
  );
}
