'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';
import type { ApiResponse, AuthResponse } from '@/lib/types';
import { AmbientBackdrop } from '@/components/brand/AmbientBackdrop';

/**
 * OAuth2 callback page.
 * The backend OAuth2 success handler sets tokens in httpOnly cookies
 * and redirects here. This page exchanges the cookies for tokens via
 * a server call, stores them, and redirects to the dashboard.
 */
export default function OAuth2CallbackPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const exchangingRef = useRef(false);

  useEffect(() => {
    if (exchangingRef.current) return;
    exchangingRef.current = true;

    const exchange = async () => {
      try {
        const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/oauth2/exchange');
        const { accessToken, refreshToken, user } = res.data.data;
        login(user, accessToken, refreshToken);
        router.replace('/dashboard');
      } catch {
        toast.error('OAuth2 sign-in failed. Please try again.');
        router.replace('/login');
      }
    };

    exchange();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <AmbientBackdrop intensity="bold" />
      <div className="glass-panel surface-outline relative w-full max-w-lg rounded-[2rem] p-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.28em] text-primary/80">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure handoff
        </div>
        <h1 className="text-3xl font-semibold">Completing sign-in</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          We&apos;re finalizing your authenticated workspace session and preparing the redesigned dashboard.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Connecting your secure session...</p>
        </div>
      </div>
    </div>
  );
}
