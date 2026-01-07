'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase, Candidate } from '@/lib/supabase';
import { Users, Search, Mail, Phone, GraduationCap, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCandidates = candidates.filter(candidate =>
    candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.skills?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600 mt-1">View and manage all candidates</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates by name, email, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Candidates List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading candidates...</p>
          </div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">Candidates will appear here as applications are received</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold shrink-0">
                  {candidate.full_name.charAt(0)}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {candidate.full_name}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {candidate.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{candidate.email}</span>
                          </div>
                        )}
                        {candidate.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{candidate.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link href={`/candidates/${candidate.id}`}>
                      <Button variant="ghost" size="sm">View Profile</Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {candidate.education && (
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <GraduationCap className="w-4 h-4" />
                          <span className="font-medium">Education</span>
                        </div>
                        <p className="text-gray-900">{candidate.education}</p>
                      </div>
                    )}
                    
                    {candidate.experience_years !== null && (
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Briefcase className="w-4 h-4" />
                          <span className="font-medium">Experience</span>
                        </div>
                        <p className="text-gray-900">{candidate.experience_years} years</p>
                      </div>
                    )}

                    {candidate.skills && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-medium">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.split(',').slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                          {candidate.skills.split(',').length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              +{candidate.skills.split(',').length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {candidate.resume_url && (
                    <div className="mt-4">
                      <a
                        href={candidate.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Resume →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
