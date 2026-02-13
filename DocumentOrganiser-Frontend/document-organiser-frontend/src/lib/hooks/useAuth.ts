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
  const lastExchangedTokenRef = useRef<string | null>(null);

  // Exchange Google ID token for backend JWT on sign-in.
  // Runs whenever a new idToken appears (fresh Google OAuth).
  // If the store has stale auth from localStorage, we re-exchange
  // because the old backend JWT may be expired.
  useEffect(() => {
    const exchangeToken = async () => {
      if (
        session?.idToken &&
        !exchangingRef.current &&
        !exchangeFailedRef.current &&
        session.idToken !== lastExchangedTokenRef.current
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
          lastExchangedTokenRef.current = session.idToken;
          exchangeFailedRef.current = false;
          // Redirect to dashboard after successful token exchange
          router.replace('/dashboard');
        } catch (error) {
          console.error('Failed to exchange token with backend:', error);
          exchangeFailedRef.current = true;
          lastExchangedTokenRef.current = session.idToken;
          // Sign out the NextAuth session so the login form is shown
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
  }, [session?.idToken]); // eslint-disable-line react-hooks/exhaustive-deps

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
