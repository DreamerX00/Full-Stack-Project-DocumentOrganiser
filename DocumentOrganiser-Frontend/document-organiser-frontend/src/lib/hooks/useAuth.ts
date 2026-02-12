'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Module-level flag prevents duplicate calls across StrictMode re-mounts
let isExchanging = false;

export function useAuth() {
  const { data: session, status } = useSession();
  const store = useAuthStore();
  const router = useRouter();

  // Exchange Google ID token for backend JWT on first sign-in
  useEffect(() => {
    const exchangeToken = async () => {
      if (
        session?.idToken &&
        !store.isAuthenticated &&
        !isExchanging
      ) {
        isExchanging = true;
        try {
          const authResponse = await authApi.loginWithGoogle({
            idToken: session.idToken,
          });
          store.login(
            authResponse.user,
            authResponse.accessToken,
            authResponse.refreshToken
          );
          // Redirect to dashboard after successful token exchange
          router.replace('/dashboard');
        } catch (error) {
          console.error('Failed to exchange token with backend:', error);
          isExchanging = false;
        }
      }
    };

    exchangeToken();
  }, [session?.idToken, store.isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const loginWithGoogle = useCallback(async () => {
    await signIn('google', { callbackUrl: '/dashboard' });
  }, []);

  const logout = useCallback(async () => {
    try {
      if (store.refreshToken) {
        await authApi.logout(store.refreshToken);
      }
    } catch {
      // Ignore backend logout errors
    }
    store.logout();
    await signOut({ callbackUrl: '/' });
  }, [store]);

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: status === 'loading' || store.isLoading,
    session,
    loginWithGoogle,
    logout,
  };
}
