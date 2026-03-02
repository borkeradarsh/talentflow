'use client';

import Link from 'next/link';
import { Brain, Zap, Users, BarChart3, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Screening',
      description: 'Intelligent resume parsing and candidate evaluation using advanced NLP and ML algorithms'
    },
    {
      icon: Zap,
      title: 'Automated Workflows',
      description: 'Streamline your hiring process with intelligent automation and smart routing'
    },
    {
      icon: Users,
      title: 'Candidate Tracking',
      description: 'Comprehensive candidate profiles, history, and journey tracking through the pipeline'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Insightful recruitment metrics and dashboards to track your hiring performance'
    },
    {
      icon: Sparkles,
      title: 'Interview Scheduling',
      description: 'Automated interview scheduling with calendar integration and smart notifications'
    },
    {
      icon: CheckCircle2,
      title: 'Pipeline Management',
      description: 'Track applications through different stages with visual pipeline management'
    }
  ];

  const steps = [
    { number: '1', title: 'Post Jobs', description: 'Create and manage job postings across platforms' },
    { number: '2', title: 'AI Screening', description: 'Let AI evaluate and rank candidates automatically' },
    { number: '3', title: 'Schedule', description: 'Intelligent interview scheduling with sync to your calendar' },
    { number: '4', title: 'Hire', description: 'Make data-driven hiring decisions with analytics' }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background animated elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">TalentFlow</span>
            </div>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-blue-400">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Hire Smarter, Faster, Better
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed">
                  TalentFlow AI revolutionizes recruitment with intelligent automation, AI-powered screening, and smart candidate matching. Transform your hiring from days to hours.
                </p>
              </div>
              <div className="flex gap-4">
                <Link href="/signup">
                  <Button variant="primary" size="lg" className="group">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <button className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg font-medium transition-colors border border-slate-600">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* SVG Illustration */}
            <div className="relative h-96 animate-float" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
              <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Decorative animated SVG */}
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                
                {/* Main circle */}
                <circle cx="200" cy="200" r="150" fill="none" stroke="url(#grad1)" strokeWidth="2" opacity="0.5" className="animate-spin-slow" />
                <circle cx="200" cy="200" r="120" fill="none" stroke="url(#grad1)" strokeWidth="1.5" opacity="0.3" className="animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                
                {/* Center icon area */}
                <rect x="140" y="140" width="120" height="120" rx="20" fill="url(#grad1)" fillOpacity="0.1" stroke="url(#grad1)" strokeWidth="2" />
                
                {/* Decorative nodes */}
                <circle cx="80" cy="100" r="8" fill="#3B82F6" opacity="0.8" className="animate-pulse" />
                <circle cx="320" cy="100" r="8" fill="#8B5CF6" opacity="0.8" className="animate-pulse animation-delay-500" />
                <circle cx="80" cy="300" r="8" fill="#EC4899" opacity="0.8" className="animate-pulse animation-delay-1000" />
                <circle cx="320" cy="300" r="8" fill="#3B82F6" opacity="0.8" className="animate-pulse animation-delay-1500" />
                
                {/* Connection lines */}
                <line x1="200" y1="70" x2="200" y2="130" stroke="#3B82F6" strokeWidth="2" opacity="0.4" />
                <line x1="200" y1="270" x2="200" y2="330" stroke="#3B82F6" strokeWidth="2" opacity="0.4" />
                <line x1="70" y1="200" x2="130" y2="200" stroke="#8B5CF6" strokeWidth="2" opacity="0.4" />
                <line x1="270" y1="200" x2="330" y2="200" stroke="#EC4899" strokeWidth="2" opacity="0.4" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-700/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '10x', label: 'Faster Hiring' },
            { value: '95%', label: 'Accuracy Rate' },
            { value: '500+', label: 'Companies Trust Us' },
            { value: '24h', label: 'Avg First Match' }
          ].map((stat, i) => (
            <div key={i} className="text-center animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-slate-400 mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Modern Recruitment</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Everything you need to build a world-class recruitment process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative p-6 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative">
                    <Icon className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-4xl font-bold mb-4">How TalentFlow Works</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              A streamlined process designed to save you time and hire better candidates
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative animate-fadeIn" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xl font-bold mb-4 hover:scale-110 transition-transform">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-center text-sm">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-blue-400/50 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fadeIn">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join hundreds of companies already using TalentFlow to hire smarter, faster, and better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg" className="border border-slate-600">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
          <p className="text-slate-400 text-sm mt-6">
            No credit card required. Start free today.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-700/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <div>© 2026 TalentFlow AI. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
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

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }

        .animation-delay-1500 {
          animation-delay: 1500ms;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
