"use client";

import { useState, Suspense } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (!token) {
      setStatus("Invalid reset token.");
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      setStatus("Password reset successful. You can now login.");
    } catch (err) {
      setStatus("Something went wrong. The link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[10px] font-bold tracking-widest uppercase text-white/50">New Password</Label>
        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      {status && <p className="text-[11px] font-bold tracking-widest uppercase text-brandAccent">{status}</p>}
      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={loading || !token}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password below">
      <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-10 bg-muted rounded-xl"></div><div className="h-12 bg-muted rounded-xl"></div></div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
