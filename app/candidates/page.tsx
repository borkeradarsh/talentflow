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
  const [filter, setFilter] = useState<'all' | 'recent' | 'experienced'>('all');
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

  const getFilteredByStatus = () => {
    switch (filter) {
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return candidates.filter(c => new Date(c.created_at) >= thirtyDaysAgo);
      case 'experienced':
        return candidates.filter(c => c.experience_years && c.experience_years >= 5);
      default:
        return candidates;
    }
  };

  const filteredByStatus = getFilteredByStatus();
  const filteredCandidates = filteredByStatus.filter(candidate =>
    candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.skills?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusCounts = {
    all: candidates.length,
    recent: candidates.filter(c => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(c.created_at) >= thirtyDaysAgo;
    }).length,
    experienced: candidates.filter(c => c.experience_years && c.experience_years >= 5).length,
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start mb-8 animate-slideInLeft">
        <div>
          <h1 className="text-4xl font-bold text-white">Candidates</h1>
          <p className="text-gray-400 mt-2">View and manage all candidates</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(statusCounts).map(([status, count], idx) => (
          <div
            key={status}
            className="cursor-pointer animate-slideInUp"
            style={{ animationDelay: `${idx * 50}ms` }}
            onClick={() => setFilter(status as 'all' | 'recent' | 'experienced')}
          >
            <Card
              className={`group transition-all duration-300 ${
                filter === status ? 'ring-2 ring-[#FF7F00] shadow-lg shadow-orange-900/30' : ''
              }`}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{count}</p>
                <p className="text-sm text-gray-400 capitalize mt-2 group-hover:text-gray-300 transition-colors">{status}</p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search candidates by name, email, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-[#262626] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7F00] placeholder:text-gray-600 transition-all hover:border-[#404040]"
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 bg-[#FF7F00] rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-[#0a0a0a] rounded-full"></div>
            </div>
            <p className="text-gray-300">Loading candidates...</p>
          </div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-gray-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No candidates found</h3>
            <p className="text-gray-500">Candidates will appear here as applications are received</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate, idx) => (
            <Card 
              key={candidate.id} 
              className="group hover:border-[#FF7F00]/70 transition-all duration-300 animate-slideInUp"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="w-16 h-16 bg-[#FF7F00] rounded-full flex items-center justify-center text-white text-2xl font-semibold shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-orange-900/30">
                  {candidate.full_name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-[#FF7F00] transition-colors mb-1">
                        {candidate.full_name}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
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
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white shrink-0">View Profile</Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {candidate.education && (
                      <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#262626] group-hover:border-[#FF7F00]/30 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <GraduationCap className="w-4 h-4" />
                          <span className="font-medium">Education</span>
                        </div>
                        <p className="text-white">{candidate.education}</p>
                      </div>
                    )}
                    
                    {candidate.experience_years !== null && (
                      <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#262626] group-hover:border-[#FF7F00]/30 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Briefcase className="w-4 h-4" />
                          <span className="font-medium">Experience</span>
                        </div>
                        <p className="text-white">{candidate.experience_years} years</p>
                      </div>
                    )}

                    {candidate.skills && (
                      <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#262626] group-hover:border-[#FF7F00]/30 transition-colors">
                        <p className="text-sm text-gray-500 mb-2 font-medium">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.skills.split(',').slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 bg-[#FF7F00]/20 text-[#FF7F00] border border-[#FF7F00]/50 rounded text-xs hover:border-[#FF7F00] transition-colors"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                          {candidate.skills.split(',').length > 3 && (
                            <span className="px-2.5 py-0.5 bg-[#262626] text-gray-400 border border-[#404040] rounded text-xs">
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
                        className="text-[#FF7F00] hover:text-orange-600 text-sm font-medium transition-colors"
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

        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out;
          opacity: 1;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
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
