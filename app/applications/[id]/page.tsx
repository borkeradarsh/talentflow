'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Mail, Phone, FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

type StatusType = 'applied' | 'shortlisted' | 'interview' | 'hired' | 'rejected';

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  education: string;
  experience_years: number | null;
  skills: string;
  resume_url: string;
  resume_score: number | null;
}

interface Job {
  id: string;
  title: string;
  description: string;
  required_skills: string;
  min_experience: number;
  status: StatusType;
}

interface Application {
  id: string;
  status: StatusType;
  applied_at: string;
  ai_score: number | null;
  candidates: Candidate;
  jobs: Job;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const appId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [scoring, setScoring] = useState(false);

  const fetchApplicationDetails = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          candidates (*),
          jobs (*)
        `)
        .eq('id', appId)
        .single();

      if (error) throw error;
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    if (appId) {
      fetchApplicationDetails();
    }
  }, [appId, fetchApplicationDetails]);

  async function updateApplicationStatus(newStatus: string) {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) throw error;
      setApplication((prev) => prev ? { ...prev, status: newStatus as StatusType } : null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  }

  async function scoreApplication() {
    if (!application) return;
    setScoring(true);
    try {
      const res = await fetch('/api/score-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to score');
      setApplication((prev) => prev ? { ...prev, ai_score: data.score } : null);
    } catch (error) {
      console.error('Error scoring application:', error);
      alert('Failed to score application');
    } finally {
      setScoring(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Application not found</h2>
        <Link href="/applications">
          <Button>Back to Applications</Button>
        </Link>
      </div>
    );
  }

  const candidate = application.candidates;
  const job = application.jobs;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/applications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <Badge status={application.status} />
      </div>

      <Card title="Candidate Information">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold shrink-0">
            {candidate.full_name.charAt(0)}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{candidate.full_name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {candidate.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${candidate.email}`} className="hover:text-blue-600">
                    {candidate.email}
                  </a>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{candidate.phone}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-background rounded-lg">
              <div>
                <p className="text-sm text-[#FF7F00] mb-1">Education</p>
                <p className="font-medium">{candidate.education || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-[#FF7F00] mb-1">Experience</p>
                <p className="font-medium">
                  {candidate.experience_years !== null ? `${candidate.experience_years} years` : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#FF7F00] mb-1">Applied On</p>
                <p className="font-medium">
                  {new Date(application.applied_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#FF7F00] mb-1">Resume Score</p>
                {application.ai_score !== null && application.ai_score !== undefined ? (
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${
                      application.ai_score >= 75 ? 'text-green-400' :
                      application.ai_score >= 50 ? 'text-yellow-400' :
                      application.ai_score >= 25 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {application.ai_score}/100
                    </span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={scoreApplication}
                    disabled={scoring}
                  >
                    {scoring ? 'Scoring...' : 'Score'}
                  </Button>
                )}
              </div>
            </div>

            {candidate.resume_url && (
              <div className="mt-4">
                <a
                  href={candidate.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary">
                    <FileText className="w-4 h-4 mr-2" />
                    View Resume
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </Card>

      {candidate.skills && (
        <Card title="Skills">
          <div className="flex flex-wrap gap-2">
            {candidate.skills.split(',').map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-background rounded-lg text-sm font-medium"
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card title="Job Details">
        <div className="space-y-3">
          <div>
            <h3 className="text-xl text-[#FF7F00] font-semibold mb-1">{job.title}</h3>
            <Badge status={job.status} />
          </div>
          <p className="whitespace-pre-wrap">{job.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background rounded-lg mt-4">
            <div>
              <p className="text-sm mb-1">Required Skills</p>
              <p className="font-medium ">{job.required_skills || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm  mb-1">Minimum Experience</p>
              <p className="font-medium ">{job.min_experience}+ years</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Update Application Status">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Button
            variant={application.status === 'applied' ? 'primary' : 'secondary'}
            onClick={() => updateApplicationStatus('applied')}
            disabled={updating || application.status === 'applied'}
            className="w-full"
          >
            Applied
          </Button>
          <Button
            variant={application.status === 'shortlisted' ? 'primary' : 'secondary'}
            onClick={() => updateApplicationStatus('shortlisted')}
            disabled={updating || application.status === 'shortlisted'}
            className="w-full"
          >
            Shortlist
          </Button>
          <Button
            variant={application.status === 'interview' ? 'primary' : 'secondary'}
            onClick={() => updateApplicationStatus('interview')}
            disabled={updating || application.status === 'interview'}
            className="w-full"
          >
            Interview
          </Button>
          <Button
            variant={application.status === 'hired' ? 'primary' : 'secondary'}
            onClick={() => updateApplicationStatus('hired')}
            disabled={updating || application.status === 'hired'}
            className="w-full"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Hire
          </Button>
          <Button
            variant={application.status === 'rejected' ? 'danger' : 'secondary'}
            onClick={() => updateApplicationStatus('rejected')}
            disabled={updating || application.status === 'rejected'}
            className="w-full"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      </Card>

      {application.status === 'interview' && (
        <Card title="Schedule Interview">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600 mb-4">Schedule an interview with {candidate.full_name}</p>
            <Link href={`/interviews/new?candidateId=${candidate.id}&jobId=${job.id}`}>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
