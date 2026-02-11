'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { useCallback, useEffect, useRef } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const store = useAuthStore();
  const hasExchangedRef = useRef(false);

  // Exchange Google ID token for backend JWT on first sign-in
  useEffect(() => {
    const exchangeToken = async () => {
      if (
        session?.idToken &&
        !store.isAuthenticated &&
        !hasExchangedRef.current
      ) {
        hasExchangedRef.current = true;
        try {
          const authResponse = await authApi.loginWithGoogle({
            idToken: session.idToken,
          });
          store.login(
            authResponse.user,
            authResponse.accessToken,
            authResponse.refreshToken
          );
        } catch (error) {
          console.error('Failed to exchange token with backend:', error);
          hasExchangedRef.current = false;
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
