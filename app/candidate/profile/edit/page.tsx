'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CandidateSidebar from '@/components/layout/CandidateSidebar';
import CandidateHeader from '@/components/layout/CandidateHeader';
import { User, Mail, Phone, Briefcase, GraduationCap, Upload, ArrowLeft, Save } from 'lucide-react';

export default function CandidateProfileEditPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState('');
  const [candidateData, setCandidateData] = useState<{
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    education?: string;
    experience_years?: number;
    skills?: string;
    resume_url?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    education: '',
    experience_years: 0,
    skills: '',
    resume_url: ''
  });

  const fetchCandidateData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('email', user?.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching candidate:', error);
      } else if (data) {
        setCandidateData(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          education: data.education || '',
          experience_years: data.experience_years || 0,
          skills: data.skills || '',
          resume_url: data.resume_url || ''
        });
      } else {
        // No candidate profile yet, use user data
        setFormData(prev => ({
          ...prev,
          full_name: user?.user_metadata?.name || ''
        }));
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.user_metadata?.name]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchCandidateData();
    }
  }, [user, authLoading, router, fetchCandidateData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (candidateData) {
        // Update existing candidate
        const { error } = await supabase
          .from('candidates')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', candidateData.id);

        if (error) {
          console.error('Error updating candidate profile:', error);
          throw error;
        }
      } else {
        // Create new candidate
        const { error } = await supabase
          .from('candidates')
          .insert([{
            ...formData,
            email: user?.email,
            created_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('Error creating candidate profile:', error);
          throw error;
        }
      }

      router.push('/candidate/profile');
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : typeof error === 'string'
            ? error
            : 'Failed to save profile. Please try again.';
      console.error('Error saving profile:', error);
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeUploadError('');

    if (!file) return;

    if (file.type !== 'application/pdf') {
      setResumeUploadError('Please upload a PDF file.');
      e.target.value = '';
      return;
    }

    const maxSizeMb = 10;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setResumeUploadError(`PDF must be smaller than ${maxSizeMb}MB.`);
      e.target.value = '';
      return;
    }

    if (!user?.id) {
      setResumeUploadError('You must be logged in to upload a resume.');
      e.target.value = '';
      return;
    }

    setResumeUploading(true);

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${user.id}/resume-${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
      if (!data?.publicUrl) {
        throw new Error('Failed to generate resume URL.');
      }

      setFormData(prev => ({ ...prev, resume_url: data.publicUrl }));
    } catch (err) {
      console.error('Resume upload failed:', err);
      setResumeUploadError('Resume upload failed. Please try again.');
      e.target.value = '';
    } finally {
      setResumeUploading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <CandidateSidebar />
      <CandidateHeader />

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => router.push('/candidate/profile')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Profile</h1>
              <p className="text-slate-400">Update your professional information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-slate-200 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          required
                          value={formData.full_name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-200 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h2 className="text-xl font-bold mb-6">Professional Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="education" className="block text-sm font-medium text-slate-200 mb-2">
                        Education
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <textarea
                          id="education"
                          name="education"
                          value={formData.education}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Bachelor's in Computer Science, XYZ University"
                          className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="experience_years" className="block text-sm font-medium text-slate-200 mb-2">
                        Years of Experience
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          id="experience_years"
                          name="experience_years"
                          min="0"
                          max="50"
                          value={formData.experience_years}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium text-slate-200 mb-2">
                        Skills
                      </label>
                      <textarea
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        rows={4}
                        placeholder="JavaScript, React, Node.js, Python, etc. (comma-separated)"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">Separate skills with commas</p>
                    </div>

                    <div>
                      <label htmlFor="resume_file" className="block text-sm font-medium text-slate-200 mb-2">
                        Upload Resume (PDF)
                      </label>
                      <div className="relative">
                        <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="file"
                          id="resume_file"
                          name="resume_file"
                          accept="application/pdf"
                          onChange={handleResumeFileChange}
                          className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-600 file:text-slate-100 hover:file:bg-slate-500"
                          disabled={resumeUploading}
                        />
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-xs text-slate-500">PDF only, max 10MB.</p>
                        {resumeUploading && (
                          <p className="text-xs text-blue-400">Uploading resume...</p>
                        )}
                        {resumeUploadError && (
                          <p className="text-xs text-red-400">{resumeUploadError}</p>
                        )}
                        {formData.resume_url && !resumeUploading && (
                          <a
                            href={formData.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 w-fit"
                          >
                            View uploaded resume
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="sticky top-24">
                  <h3 className="font-semibold mb-4">Profile Completion</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${formData.full_name ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                      <span className={formData.full_name ? 'text-white' : 'text-slate-400'}>Full Name</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${formData.phone ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                      <span className={formData.phone ? 'text-white' : 'text-slate-400'}>Phone Number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${formData.education ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                      <span className={formData.education ? 'text-white' : 'text-slate-400'}>Education</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${formData.experience_years > 0 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                      <span className={formData.experience_years > 0 ? 'text-white' : 'text-slate-400'}>Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${formData.skills ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                      <span className={formData.skills ? 'text-white' : 'text-slate-400'}>Skills</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${formData.resume_url ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                      <span className={formData.resume_url ? 'text-white' : 'text-slate-400'}>Resume</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving || resumeUploading || !formData.full_name}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Profile'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push('/candidate/profile')}
                      className="w-full mt-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
