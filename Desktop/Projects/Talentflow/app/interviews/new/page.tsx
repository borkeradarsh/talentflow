'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

export default function NewInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    candidate_id: searchParams.get('candidateId') || '',
    job_id: searchParams.get('jobId') || '',
    start_time: '',
    end_time: '',
    google_event_id: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled'
  });

  useEffect(() => {
    fetchCandidatesAndJobs();
  }, []);

  async function fetchCandidatesAndJobs() {
    try {
      const [{ data: candidatesData }, { data: jobsData }] = await Promise.all([
        supabase.from('candidates').select('id, full_name, email').order('full_name'),
        supabase.from('jobs').select('id, title, status').eq('status', 'open').order('title')
      ]);

      setCandidates(candidatesData || []);
      setJobs(jobsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate times
      if (new Date(formData.start_time) >= new Date(formData.end_time)) {
        alert('End time must be after start time');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('interviews').insert([formData]);

      if (error) throw error;

      router.push('/interviews');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/interviews">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Schedule Interview</h1>
          <p className="text-gray-300 mt-1">Schedule a new candidate interview</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Candidate Selection */}
          <div>
            <label htmlFor="candidate_id" className="block text-sm font-medium text-gray-700 mb-2">
              Candidate *
            </label>
            <select
              id="candidate_id"
              name="candidate_id"
              required
              value={formData.candidate_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a candidate</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.full_name} ({candidate.email})
                </option>
              ))}
            </select>
          </div>

          {/* Job Selection */}
          <div>
            <label htmlFor="job_id" className="block text-sm font-medium text-gray-700 mb-2">
              Job Position *
            </label>
            <select
              id="job_id"
              name="job_id"
              required
              value={formData.job_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
              Start Time *
            </label>
            <input
              type="datetime-local"
              id="start_time"
              name="start_time"
              required
              value={formData.start_time}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
              End Time *
            </label>
            <input
              type="datetime-local"
              id="end_time"
              name="end_time"
              required
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Google Event ID (Optional) */}
          <div>
            <label htmlFor="google_event_id" className="block text-sm font-medium text-gray-700 mb-2">
              Google Calendar Event ID (Optional)
            </label>
            <input
              type="text"
              id="google_event_id"
              name="google_event_id"
              value={formData.google_event_id}
              onChange={handleChange}
              placeholder="Will be auto-generated if left empty"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to auto-generate Google Calendar event
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/interviews">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <CalendarIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Google Calendar Integration</h3>
            <p className="text-sm text-blue-800">
              When you schedule an interview, TalentFlow AI can automatically create a Google Calendar event
              and send invitations to both the candidate and interviewer. Make sure your Google Calendar API
              is properly configured in the settings.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
