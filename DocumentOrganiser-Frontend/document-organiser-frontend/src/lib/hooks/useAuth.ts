'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const store = useAuthStore();
  const router = useRouter();
  const exchangingRef = useRef(false);
  const exchangeFailedRef = useRef(false);

  // Exchange Google ID token for backend JWT on first sign-in
  useEffect(() => {
    const exchangeToken = async () => {
      if (
        session?.idToken &&
        !store.isAuthenticated &&
        !exchangingRef.current &&
        !exchangeFailedRef.current
      ) {
        exchangingRef.current = true;
        try {
          const authResponse = await authApi.loginWithGoogle({
            idToken: session.idToken,
          });
          store.login(
            authResponse.user,
            authResponse.accessToken,
            authResponse.refreshToken
          );
          exchangeFailedRef.current = false;
          // Redirect to dashboard after successful token exchange
          router.replace('/dashboard');
        } catch (error) {
          console.error('Failed to exchange token with backend:', error);
          // Mark exchange as failed so we don't retry in a loop.
          // The login page will detect !isAuthenticated and show the form.
          exchangeFailedRef.current = true;
          // Sign out the NextAuth session so the login form is shown
          // (otherwise the login page sees session=truthy and shows spinner)
          try {
            await signOut({ redirect: false });
          } catch {
            // ignore
          }
        } finally {
          exchangingRef.current = false;
        }
      }
    };

    exchangeToken();
  }, [session?.idToken, store.isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset the failure flag when there's no session (user signed out or fresh visit)
  useEffect(() => {
    if (!session) {
      exchangeFailedRef.current = false;
    }
  }, [session]);

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
