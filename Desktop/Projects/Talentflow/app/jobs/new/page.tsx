'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewJobPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    min_experience: 0,
    status: 'open' as 'open' | 'closed'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to create a job');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('jobs').insert([
        {
          ...formData,
          created_by: user.id
        }
      ]);

      if (error) throw error;

      router.push('/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'min_experience' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 animate-slideInLeft">
        <Link href="/jobs">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-blue-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Post New Job</h1>
          <p className="text-slate-400 mt-2">Create a new job posting</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-100 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 transition-all hover:border-slate-500"
            />
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-100 mb-2">
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Provide a detailed description of the role, responsibilities, and requirements..."
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-500 transition-all hover:border-slate-500"
            />
          </div>

          {/* Required Skills */}
          <div>
            <label htmlFor="required_skills" className="block text-sm font-medium text-slate-100 mb-2">
              Required Skills
            </label>
            <input
              type="text"
              id="required_skills"
              name="required_skills"
              value={formData.required_skills}
              onChange={handleChange}
              placeholder="e.g., React, Node.js, TypeScript, Python"
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 transition-all hover:border-slate-500"
            />
            <p className="text-sm text-slate-400 mt-1">Separate skills with commas</p>
          </div>

          {/* Minimum Experience */}
          <div>
            <label htmlFor="min_experience" className="block text-sm font-medium text-slate-100 mb-2">
              Minimum Experience (years)
            </label>
            <input
              type="number"
              id="min_experience"
              name="min_experience"
              min="0"
              value={formData.min_experience}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 transition-all hover:border-slate-500"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-100 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:border-slate-500"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/jobs">
              <Button type="button" variant="ghost" className="text-slate-300 hover:text-slate-100">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              {loading ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </Card>

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

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
