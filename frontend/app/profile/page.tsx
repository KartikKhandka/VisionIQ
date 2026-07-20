"use client";

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Not authenticated</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <div className="bg-card border border-border p-6 rounded-lg shadow-sm space-y-4 max-w-xl">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
          <p className="text-lg">{user.full_name || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
          <p className="text-lg">{user.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
          <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        
        <div className="pt-4 border-t border-border">
          <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => logout()}>Logout</Button>
        </div>
      </div>
    </div>
  );
}
