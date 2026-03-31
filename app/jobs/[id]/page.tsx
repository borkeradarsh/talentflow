'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { supabase, Job, Application } from '@/lib/supabase';
import { ArrowLeft, Users, Calendar, Edit } from 'lucide-react';
import Link from 'next/link';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  async function fetchJobDetails() {
    try {
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // Fetch applications for this job
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          candidates (full_name, email, skills)
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (appsError) throw appsError;
      setApplications(appsData || []);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (newStatus: 'open' | 'closed') => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;
      setJob(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">Job not found</h2>
        <Link href="/jobs">
          <Button>Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="ghost" size="sm" className='text-white'>
              <ArrowLeft className="w-4 h-4 mr-2 text-white" />
              Back
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          {job.status === 'open' ? (
            <Button variant="secondary" onClick={() => handleStatusChange('closed')}>
              Close Job
            </Button>
          ) : (
            <Button onClick={() => handleStatusChange('open')}>
              Reopen Job
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-amber-50 mb-2">{job.title}</h1>
              <Badge status={job.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-gray-200">
            <div>
              <p className="text-sm text-amber-50 mb-1">Required Skills</p>
              <p className="font-medium text-gray-400">{job.required_skills || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-amber-50 mb-1">Min. Experience</p>
              <p className="font-medium text-gray-400">{job.min_experience}+ years</p>
            </div>
            <div>
              <p className="text-sm text-amber-50 mb-1">Posted On</p>
              <p className="font-medium text-gray-400">
                {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-amber-50 mb-2">Job Description</h3>
            <p className="text-gray-400 whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>
      </Card>

      <Card title={`Applications (${applications.length})`}>
        {applications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No applications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {app.candidates?.full_name?.charAt(0) || 'C'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-400">{app.candidates?.full_name}</p>
                    <p className="text-sm text-gray-400">{app.candidates?.email}</p>
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
