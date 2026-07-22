"use client";

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { WorkspaceLayout } from "@/components/workspace-layout";

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return <WorkspaceLayout><div className="p-12 text-white/50">Loading profile...</div></WorkspaceLayout>;
  if (!user) return <WorkspaceLayout><div className="p-12 text-white/50">Not authenticated</div></WorkspaceLayout>;

  return (
    <WorkspaceLayout>
      <div className="max-w-4xl mx-auto w-full px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-12">
            <h1 className="text-3xl font-semibold text-white tracking-tight">Account Settings</h1>
            <p className="text-white/40 mt-2 text-sm">Manage your profile, email preferences, and security.</p>
          </div>
          
          <div className="space-y-12">
            {/* Profile Section */}
            <section>
              <h2 className="text-[13px] font-semibold text-white/90 uppercase tracking-widest mb-6">Profile</h2>
              
              <div className="space-y-6 max-w-xl">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-white/60">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="text" 
                      defaultValue={user.full_name || ''} 
                      placeholder="Your full name"
                      className="w-full bg-transparent border-0 border-b border-white/10 px-7 py-2 text-white placeholder-white/20 focus:ring-0 focus:border-white/50 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-white/60">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="email" 
                      defaultValue={user.email} 
                      disabled
                      className="w-full bg-transparent border-0 border-b border-white/10 px-7 py-2 text-white/50 focus:ring-0 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-white/30">Contact support to change your email address.</p>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-white/[0.05]"></div>

            {/* Account Info Section */}
            <section>
              <h2 className="text-[13px] font-semibold text-white/90 uppercase tracking-widest mb-6">Security & Data</h2>
              
              <div className="space-y-6 max-w-xl">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-white/60">Account Created</label>
                  <div className="relative">
                    <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="text" 
                      defaultValue={new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} 
                      disabled
                      className="w-full bg-transparent border-0 border-b border-white/10 px-7 py-2 text-white/50 focus:ring-0 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </section>
            
            <div className="pt-8">
              <Button 
                onClick={() => logout()}
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 h-auto text-sm font-medium gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out of all devices
              </Button>
            </div>

          </div>
        </motion.div>
      </div>
    </WorkspaceLayout>
  );
}
