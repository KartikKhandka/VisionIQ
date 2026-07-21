"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth-layout';
import Link from 'next/link';

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: any) => {
    login(data);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-bold tracking-widest uppercase text-white/50">Email Address</Label>
          <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message?.toString()}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[10px] font-bold tracking-widest uppercase text-white/50">Password</Label>
            <Link href="/forgot-password" className="text-[10px] font-bold tracking-widest uppercase text-brandAccent hover:text-brandAccent-light transition-colors">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message?.toString()}</p>}
        </div>
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>
      <div className="mt-6 text-center text-[11px] font-bold tracking-widest uppercase text-white/40">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brandAccent hover:text-brandAccent-light transition-colors ml-1">
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
}
