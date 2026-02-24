'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';
import type { ApiResponse, AuthResponse } from '@/lib/types';

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
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Completing sign-in...</p>
      </div>
    </div>
  );
}
