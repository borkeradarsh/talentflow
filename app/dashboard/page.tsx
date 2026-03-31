'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { supabase, Application } from '@/lib/supabase';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar,
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
  const [recentApplications, setRecentApplications] = useState<(Application & { candidates?: { full_name: string }; jobs?: { title: string } })[]>([]);
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
      color: '#FF7F00',
    },
    {
      title: 'Open Jobs',
      value: stats.openJobs,
      icon: Briefcase,
      color: '#22c55e',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: '#f97316',
    },
    {
      title: 'Upcoming Interviews',
      value: stats.upcomingInterviews,
      icon: Calendar,
      color: '#eab308',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-[#FF7F00] rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-[#0a0a0a] rounded-full"></div>
            </div>
          </div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start mb-8">
        <div className="animate-slideInLeft">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome back! Here&apos;s your recruitment overview</p>
        </div>
        <Link href="/jobs/new" className="animate-slideInUp" style={{ animationDelay: '100ms' }}>
          <Button variant="primary" className="group">
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
             Post New Job
          </Button>
        </Link>
      </div>

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
                  <p className="text-sm text-gray-300 font-medium">{stat.title}</p>
                  <div className="p-2 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: `${stat.color}30` }}>
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-2xl" style={{ backgroundColor: stat.color }}></div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-[#FF7F00]/30 hover:border-[#FF7F00]/50 group relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FF7F00]/20 rounded-lg flex items-center justify-center group-hover:bg-[#FF7F00]/30 transition-colors">
              <Clock className="w-6 h-6 text-[#FF7F00]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.newApplications}</p>
              <p className="text-[#FF7F00] text-sm">New Applications Today</p>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-[#FF7F00] rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-3xl"></div>
        </Card>

        <Link href="/applications" className="block group">
          <Card className="h-full group-hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Review Applications</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalApplications}</p>
              </div>
              <FileText className="w-8 h-8 text-[#FF7F00] group-hover:scale-110 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/interviews" className="block group">
          <Card className="h-full group-hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Schedule Interviews</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.upcomingInterviews}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
            </div>
          </Card>
        </Link>
      </div>

      <Card title="Recent Applications" action={
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="text-[#FF7F00] hover:text-red-600">View All →</Button>
        </Link>
      }>
        {recentApplications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p>No applications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentApplications.map((app, idx) => (
              <div 
                key={app.id} 
                className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#252525] transition-all duration-300 group border border-[#262626] hover:border-[#FF7F00]/30 animate-fadeIn"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-[#FF7F00] rounded-full flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform shadow-lg shadow-red-900/30">
                    {app.candidates?.full_name?.charAt(0) || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{app.candidates?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-400">{app.jobs?.title || 'Unknown Position'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <Badge status={app.status} />
                  <span className="text-sm text-gray-400 whitespace-nowrap">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                  <Link href={`/applications/${app.id}`}>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">View</Button>
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
