"use client";

import { useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth-layout';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus("If an account exists, a reset link has been sent.");
    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a reset link">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-bold tracking-widest uppercase text-white/50">Email Address</Label>
          <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        {status && <p className="text-[11px] font-bold tracking-widest uppercase text-brandAccent">{status}</p>}
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </form>
      <div className="mt-6 text-center text-[11px] font-bold tracking-widest uppercase text-white/40">
        Remembered your password?{' '}
        <Link href="/login" className="text-brandAccent hover:text-brandAccent-light transition-colors ml-1">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
