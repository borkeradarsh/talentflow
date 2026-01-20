'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Calendar, Plus, Search, Clock } from 'lucide-react';
import Link from 'next/link';

type StatusFilter = 'all' | 'scheduled' | 'completed' | 'cancelled';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInterviews();
  }, [filter]);

  async function fetchInterviews() {
    setLoading(true);
    try {
      let query = supabase
        .from('interviews')
        .select(`
          *,
          candidates (full_name, email),
          jobs (title)
        `);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;
      setInterviews(data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredInterviews = interviews.filter(interview =>
    interview.candidates?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingInterviews = filteredInterviews.filter(
    i => i.status === 'scheduled' && new Date(i.start_time) > new Date()
  );
  const pastInterviews = filteredInterviews.filter(
    i => i.status === 'completed' || new Date(i.start_time) <= new Date()
  );

  const statusCounts = {
    all: interviews.length,
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    cancelled: interviews.filter(i => i.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8 animate-slideInLeft">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Interviews</h1>
          <p className="text-slate-400 mt-2">Manage and schedule candidate interviews</p>
        </div>
        <Link href="/interviews/new">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Plus className="w-5 h-5 mr-2" />
            Schedule Interview
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 transition-all hover:border-slate-500"
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
              variant={filter === 'scheduled' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('scheduled')}
            >
              Scheduled
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </Button>
          </div>
        </div>
      </Card>

      {/* Interviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-slate-800 rounded-full"></div>
            </div>
            <p className="text-slate-300">Loading interviews...</p>
          </div>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No interviews found</h3>
            <p className="text-slate-400 mb-6">Schedule your first interview to get started</p>
            <Link href="/interviews/new">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="w-5 h-5 mr-2" />
                Schedule Interview
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <div className="animate-slideInUp">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent mb-4">Upcoming Interviews</h2>
              <div className="space-y-4">
                {upcomingInterviews.map((interview, idx) => (
                  <Card 
                    key={interview.id} 
                    className="group hover:border-blue-400/50 transition-all duration-300 animate-slideInUp"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start lg:items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold shrink-0 group-hover:scale-110 transition-transform">
                          {interview.candidates?.full_name?.charAt(0) || 'C'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-300 transition-colors mb-1">
                            {interview.candidates?.full_name || 'Unknown Candidate'}
                          </h3>
                          <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors mb-2">
                            Position: <span className="font-medium">{interview.jobs?.title || 'Unknown'}</span>
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(interview.start_time).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(interview.start_time).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })} - {new Date(interview.end_time).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 lg:ml-4 shrink-0">
                        <Badge status={interview.status as 'scheduled' | 'completed' | 'cancelled'} />
                        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-blue-300">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past/Completed Interviews */}
          {pastInterviews.length > 0 && (
            <div className="animate-slideInUp" style={{ animationDelay: '100ms' }}>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent mb-4">Past Interviews</h2>
              <div className="space-y-4">
                {pastInterviews.map((interview, idx) => (
                  <Card 
                    key={interview.id} 
                    className="group hover:border-slate-500/50 transition-all duration-300 opacity-80 hover:opacity-100 animate-slideInUp"
                    style={{ animationDelay: `${100 + (idx * 50)}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start lg:items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold shrink-0 group-hover:scale-110 transition-transform">
                          {interview.candidates?.full_name?.charAt(0) || 'C'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-200 group-hover:text-slate-100 transition-colors mb-1">
                            {interview.candidates?.full_name || 'Unknown Candidate'}
                          </h3>
                          <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors mb-2">
                            Position: <span className="font-medium">{interview.jobs?.title || 'Unknown'}</span>
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
                            <span>{new Date(interview.start_time).toLocaleDateString()}</span>
                            <span>
                              {new Date(interview.start_time).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Badge status={interview.status as 'scheduled' | 'completed' | 'cancelled'} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
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
