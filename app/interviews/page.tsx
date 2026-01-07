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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-600 mt-1">Manage and schedule candidate interviews</p>
        </div>
        <Link href="/interviews/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Schedule Interview
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-4">
            <Calendar className="w-10 h-10" />
            <div>
              <p className="text-2xl font-bold">{upcomingInterviews.length}</p>
              <p className="text-blue-100 text-sm">Upcoming</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-4">
            <Clock className="w-10 h-10" />
            <div>
              <p className="text-2xl font-bold">{pastInterviews.length}</p>
              <p className="text-green-100 text-sm">Completed</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {interviews.filter(i => i.status === 'cancelled').length}
            </p>
            <p className="text-sm text-gray-600">Cancelled</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by candidate or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading interviews...</p>
          </div>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
            <p className="text-gray-600 mb-6">Schedule your first interview to get started</p>
            <Link href="/interviews/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Schedule Interview
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Interviews</h2>
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <Card key={interview.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {interview.candidates?.full_name?.charAt(0) || 'C'}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {interview.candidates?.full_name || 'Unknown Candidate'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Position: <span className="font-medium">{interview.jobs?.title || 'Unknown'}</span>
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
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

                      <div className="flex items-center gap-3">
                        <Badge status={interview.status} />
                        <Button variant="ghost" size="sm">
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
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Interviews</h2>
              <div className="space-y-4">
                {pastInterviews.map((interview) => (
                  <Card key={interview.id} className="opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {interview.candidates?.full_name?.charAt(0) || 'C'}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {interview.candidates?.full_name || 'Unknown Candidate'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Position: <span className="font-medium">{interview.jobs?.title || 'Unknown'}</span>
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
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

                      <Badge status={interview.status} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
