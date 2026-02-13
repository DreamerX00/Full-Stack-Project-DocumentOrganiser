'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleLoginButton } from '@/components/features/auth/GoogleLoginButton';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading, isAuthenticated } = useAuth();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [forceShow, setForceShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Safety timeout: if we're stuck loading/redirecting for > 3 seconds,
  // clear any stale session and show the login form
  useEffect(() => {
    if (isLoading || session) {
      timeoutRef.current = setTimeout(async () => {
        // Session is stale or stuck — force sign out and show login
        try {
          await signOut({ redirect: false });
        } catch {
          // ignore
        }
        setForceShow(true);
      }, 3000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, session]);

  // If user has a valid session AND backend auth is done, redirect
  useEffect(() => {
    if (session && !isLoading && isAuthenticated && !forceShow) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      router.replace(callbackUrl);
    }
  }, [session, isLoading, isAuthenticated, callbackUrl, router, forceShow]);

  // Show loading while session is being checked or token is being exchanged
  // but only if we haven't hit the safety timeout
  if ((isLoading || (session && !forceShow)) && !forceShow) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <GoogleLoginButton />

            <div className="text-center text-sm text-muted-foreground">
              By signing in, you agree to our{' '}
              <Link href="#" className="underline hover:text-foreground">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
