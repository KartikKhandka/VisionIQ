"use client";

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Not authenticated</div>;

  return (
    <div className="p-8 max-w-xl mx-auto space-y-8 mt-4 pb-20">
      <h1 className="h1 text-white">User Profile</h1>
      <div className="vision-card p-8 space-y-6">
        <div>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-brandAccent mb-1">Full Name</h3>
          <p className="text-xl font-bold text-white">{user.full_name || 'N/A'}</p>
        </div>
        <div className="h-px bg-white/5" />
        <div>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-brandAccent mb-1">Email</h3>
          <p className="text-xl font-bold text-white">{user.email}</p>
        </div>
        <div className="h-px bg-white/5" />
        <div>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-brandAccent mb-1">Account Created</h3>
          <p className="text-xl font-bold text-white">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        
        <div className="pt-6 border-t border-white/10 mt-4">
          <Button variant="destructive" onClick={() => logout()}>Logout</Button>
        </div>
      </div>
    </div>
  );
}
