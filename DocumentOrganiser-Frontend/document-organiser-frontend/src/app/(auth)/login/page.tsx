'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthShell } from '@/components/auth/AuthShell';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/** Isolated component so `useGoogleLogin` is only called inside GoogleOAuthProvider. */
function GoogleLoginButton({ disabled }: { disabled: boolean }) {
  const { loginWithGoogle } = useAuth();

  return (
    <Button variant="outline" type="button" disabled={disabled} onClick={() => loginWithGoogle()}>
      <svg
        className="mr-2 h-4 w-4"
        aria-hidden="true"
        focusable="false"
        data-prefix="fab"
        data-icon="google"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 488 512"
      >
        <path
          fill="currentColor"
          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
        ></path>
      </svg>
      Google
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  // Redirect already-authenticated users to the dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Email/Password Form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onEmailLogin = async (data: LoginFormValues) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      login(response.user, response.accessToken, response.refreshToken);
      toast.success('Logged in successfully');
      router.push('/dashboard/documents');
    } catch (error: unknown) {
      console.error('Login error:', error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid email or password';
      toast.error(message);
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  const hasGoogleClientId = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <AuthShell
      eyebrow="Secure entry point"
      title="Sign into your workspace and pick up where the team left off."
      description="Access live review queues, shared spaces, notifications, and document intelligence from a premium collaborative surface."
      footer={
        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-muted-foreground">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary transition hover:text-primary/80">
              Create one now
            </Link>
          </p>
          <div className="flex flex-wrap gap-4 text-xs">
            <Link href="/terms" className="transition hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Welcome back</p>
          <h2 className="text-3xl font-semibold">Sign in</h2>
          <CardDescription className="text-base leading-7">
            Enter your email and password to continue into your dashboard.
          </CardDescription>
        </div>

        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardContent className="p-0">
            <div className="grid gap-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onEmailLogin)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="name@example.com"
                              type="email"
                              className="h-12 rounded-2xl border-white/10 bg-background/60 pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="••••••••"
                              type="password"
                              className="h-12 rounded-2xl border-white/10 bg-background/60 pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enter workspace
                  </Button>
                </form>
              </Form>

              {hasGoogleClientId && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-[0.28em]">
                      <span className="bg-background px-3 text-muted-foreground">or continue with</span>
                    </div>
                  </div>

                  <GoogleLoginButton disabled={isLoading} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}
