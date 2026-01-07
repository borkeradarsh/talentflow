'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalCandidates: number;
  totalJobs: number;
  totalApplications: number;
  upcomingInterviews: number;
  openJobs: number;
  newApplications: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    totalJobs: 0,
    totalApplications: 0,
    upcomingInterviews: 0,
    openJobs: 0,
    newApplications: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch stats
      const [
        { count: candidatesCount },
        { count: jobsCount },
        { count: applicationsCount },
        { count: interviewsCount },
        { count: openJobsCount },
        { count: newAppsCount },
      ] = await Promise.all([
        supabase.from('candidates').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('interviews').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'applied'),
      ]);

      setStats({
        totalCandidates: candidatesCount || 0,
        totalJobs: jobsCount || 0,
        totalApplications: applicationsCount || 0,
        upcomingInterviews: interviewsCount || 0,
        openJobs: openJobsCount || 0,
        newApplications: newAppsCount || 0,
      });

      // Fetch recent applications
      const { data: applications } = await supabase
        .from('applications')
        .select(`
          *,
          candidates (full_name, email),
          jobs (title)
        `)
        .order('applied_at', { ascending: false })
        .limit(5);

      setRecentApplications(applications || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Open Jobs',
      value: stats.openJobs,
      icon: Briefcase,
      color: 'bg-green-500',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      title: 'Upcoming Interviews',
      value: stats.upcomingInterviews,
      icon: Calendar,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your recruitment overview</p>
        </div>
        <div className="flex gap-3">
          <Link href="/jobs/new">
            <Button>Post New Job</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                </div>
              </div>
              <div className={`${stat.color} w-14 h-14 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.newApplications}</p>
              <p className="text-blue-100">New Applications Today</p>
            </div>
          </div>
        </Card>

        <Link href="/applications" className="block">
          <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Review Applications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalApplications}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </Link>

        <Link href="/interviews" className="block">
          <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Schedule Interviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingInterviews}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Applications */}
      <Card title="Recent Applications" action={
        <Link href="/applications">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      }>
        {recentApplications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No applications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {app.candidates?.full_name?.charAt(0) || 'C'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{app.candidates?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{app.jobs?.title || 'Unknown Position'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge status={app.status} />
                  <span className="text-sm text-gray-500">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                  <Link href={`/applications/${app.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

