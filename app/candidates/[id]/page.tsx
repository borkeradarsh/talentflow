'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { supabase, Candidate, Application, Interview } from '@/lib/supabase';
import { ArrowLeft, Mail, Phone, GraduationCap, Briefcase, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<(Application & { jobs?: { title: string; status: string } })[]>([]);
  const [interviews, setInterviews] = useState<(Interview & { jobs?: { title: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [scoringResume, setScoringResume] = useState(false);

  useEffect(() => {
    if (candidateId) {
      fetchCandidateDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  async function fetchCandidateDetails() {
    try {
      // Fetch candidate details
      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (candidateError) throw candidateError;
      setCandidate(candidateData);
      
      if (candidateData?.resume_score) {
        setResumeScore(candidateData.resume_score);
      } else if (candidateData?.id) {
        // Score resume if not already scored
        scoreResume(candidateData.id);
      }

      // Fetch applications
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (title, status)
        `)
        .eq('candidate_id', candidateId)
        .order('applied_at', { ascending: false });

      if (appsError) throw appsError;
      setApplications(appsData || []);

      // Fetch interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select(`
          *,
          jobs (title)
        `)
        .eq('candidate_id', candidateId)
        .order('start_time', { ascending: false });

      if (interviewsError) throw interviewsError;
      setInterviews(interviewsData || []);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function scoreResume(candidateId: string) {
    setScoringResume(true);
    try {
      const response = await fetch('/api/score-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });

      if (response.ok) {
        const { score } = await response.json();
        setResumeScore(score);
      }
    } catch (error) {
      console.error('Error scoring resume:', error);
    } finally {
      setScoringResume(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Candidate not found</h2>
        <Link href="/candidates">
          <Button>Back to Candidates</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/candidates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center text-4xl font-semibold shrink-0">
            {candidate.full_name.charAt(0)}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{candidate.full_name}</h1>
            
            <div className="flex flex-wrap gap-4 mb-4">
              {candidate.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${candidate.email}`} className="hover:text-blue-600">
                    {candidate.email}
                  </a>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{candidate.phone}</span>
                </div>
              )}
            </div>

            {candidate.resume_url && (
              <a
                href={candidate.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="secondary">
                  <FileText className="w-4 h-4 mr-2" />
                  View Resume
                </Button>
              </a>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Education">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 mt-1 text-blue-500" />
            <div>
              <p className=" font-medium">
                {candidate.education || 'Not specified'}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Experience">
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-green-300 mt-1" />
            <div>
              <p className="font-medium">
                {candidate.experience_years !== null 
                  ? `${candidate.experience_years} years` 
                  : 'Not specified'}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Member Since">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-purple-600 mt-1" />
            <div>
              <p className="font-medium">
                {new Date(candidate.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        <Card title="AI Resume Score" className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 mt-1 text-yellow-500"></div>
            <div>
              <p className="font-bold text-2xl text-yellow-500">
                {scoringResume ? 'Calculating...' : resumeScore ? `${resumeScore}%` : 'N/A'}
              </p>
              <p className="text-xs text-gray-400 mt-1">ATS Score</p>
            </div>
          </div>
        </Card>
      </div>

      {candidate.skills && (
        <Card title="Skills">
          <div className="flex flex-wrap gap-2">
            {candidate.skills.split(',').map((skill, idx) => (
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

      <Card title={`Applications (${applications.length})`}>
        {applications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg"
              >
                <div>
                  <p className="font-medium">{app.jobs?.title}</p>
                  <p className="text-sm">
                    Applied on {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={app.status} />
                  <Link href={`/applications/${app.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title={`Interviews (${interviews.length})`}>
        {interviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No interviews scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg"
              >
                <div>
                  <p className="font-medium">{interview.jobs?.title}</p>
                  <p className="text-sm text">
                    {new Date(interview.start_time).toLocaleString()} - {new Date(interview.end_time).toLocaleTimeString()}
                  </p>
                </div>
                <Badge status={interview.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
