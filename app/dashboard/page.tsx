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
  Clock,
  ArrowUpRight
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

export default function Dashboard() {
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
      gradient: 'from-blue-500 to-blue-600',
      trend: '+12%',
    },
    {
      title: 'Open Jobs',
      value: stats.openJobs,
      icon: Briefcase,
      gradient: 'from-green-500 to-emerald-600',
      trend: '+8%',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      gradient: 'from-purple-500 to-violet-600',
      trend: '+24%',
    },
    {
      title: 'Upcoming Interviews',
      value: stats.upcomingInterviews,
      icon: Calendar,
      gradient: 'from-orange-500 to-red-600',
      trend: '+5%',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-slate-800 rounded-full"></div>
            </div>
          </div>
          <p className="mt-4 text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="animate-slideInLeft">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-slate-400 mt-2">Welcome back! Here's your recruitment overview</p>
        </div>
        <Link href="/jobs/new" className="animate-slideInUp" style={{ animationDelay: '100ms' }}>
          <Button variant="primary" className="group">
            <span>Post New Job</span>
            <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="group relative overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-300 font-medium">{stat.title}</p>
                  <div className={`bg-gradient-to-br ${stat.gradient} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-slate-100">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">{stat.trend} from last month</span>
                  </div>
                </div>
              </div>
              {/* Animated background */}
              <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-2xl`}></div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-600/30 to-blue-500/20 border-blue-500/30 hover:border-blue-400/50 group relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center group-hover:bg-blue-500/50 transition-colors">
              <Clock className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{stats.newApplications}</p>
              <p className="text-blue-300 text-sm">New Applications Today</p>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-blue-500 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-3xl"></div>
        </Card>

        <Link href="/applications" className="block group">
          <Card className="h-full group-hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Review Applications</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{stats.totalApplications}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/interviews" className="block group">
          <Card className="h-full group-hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Schedule Interviews</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{stats.upcomingInterviews}</p>
              </div>
              <Calendar className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Applications */}
      <Card title="Recent Applications" action={
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">View All →</Button>
        </Link>
      }>
        {recentApplications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p>No applications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentApplications.map((app, idx) => (
              <div 
                key={app.id} 
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-300 group border border-slate-600/50 hover:border-blue-500/30 animate-fadeIn"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform">
                    {app.candidates?.full_name?.charAt(0) || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-100 truncate">{app.candidates?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-slate-400">{app.jobs?.title || 'Unknown Position'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <Badge status={app.status} />
                  <span className="text-sm text-slate-400 whitespace-nowrap">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                  <Link href={`/applications/${app.id}`}>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-300">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <style jsx>{`
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

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
          opacity: 1;
        }

        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
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
