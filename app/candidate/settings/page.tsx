'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import CandidateSidebar from '@/components/layout/CandidateSidebar';
import CandidateHeader from '@/components/layout/CandidateHeader';
import { User, Bell, Lock, Trash2 } from 'lucide-react';

export default function CandidateSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <CandidateSidebar />
      <CandidateHeader />

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-slate-400">Manage your account preferences</p>
          </div>

          <div className="max-w-4xl space-y-6">
            <Card>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Email Address</label>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Account Type</label>
                  <p className="text-white font-medium">Candidate</p>
                </div>
                <div className="pt-4">
                  <Button variant="outline" onClick={() => router.push('/candidate/profile/edit')}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-slate-400">Receive updates about your applications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Interview Reminders</p>
                    <p className="text-sm text-slate-400">Get notified before scheduled interviews</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Job Recommendations</p>
                    <p className="text-sm text-slate-400">Receive personalized job suggestions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Privacy & Security
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Visibility</p>
                    <p className="text-sm text-slate-400">Allow recruiters to view your profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="pt-4">
                  <Button variant="outline">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="border-red-500/30 bg-red-500/5">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-400">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Delete Account</p>
                  <p className="text-sm text-slate-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="danger">
                    Delete My Account
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
