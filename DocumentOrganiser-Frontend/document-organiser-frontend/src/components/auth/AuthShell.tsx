'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FileText, FolderOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { AmbientBackdrop } from '@/components/brand/AmbientBackdrop';
import { cn } from '@/lib/utils';

interface AuthShellProps {
  title: string;
  description: string;
  eyebrow: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const signals = [
  { icon: FolderOpen, label: '7 smart document categories' },
  { icon: FileText, label: 'Full-text search and discovery' },
  { icon: ShieldCheck, label: 'Version history and secure storage' },
];

export function AuthShell({ title, description, eyebrow, children, footer }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AmbientBackdrop intensity="bold" />

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-6 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[var(--shadow-soft)] backdrop-blur">
              <Image src="/logo.svg" alt="DocOrganiser" width={22} height={22} className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary/75">
                DocOrganiser
              </p>
              <p className="text-sm text-muted-foreground">Document workspace</p>
            </div>
          </Link>

          <Link href="/" className="text-sm text-muted-foreground transition hover:text-foreground">
            Back to product
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 xl:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-primary/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </div>

            <div className="space-y-5">
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                {description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {signals.map((signal) => (
                <div
                  key={signal.label}
                  className="glass-card rounded-3xl border border-white/10 px-4 py-5"
                >
                  <signal.icon className="mb-4 h-5 w-5 text-primary" />
                  <p className="text-sm font-medium">{signal.label}</p>
                </div>
              ))}
            </div>

            <div className="glass-panel surface-outline max-w-2xl rounded-[2rem] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Document workspace</p>
                  <p className="text-xs text-muted-foreground">
                    Organize, search, and manage your documents from one place.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-white/10 bg-background/50 p-4">
                  <div className="mb-4">
                    <p className="text-sm font-medium">Recent activity</p>
                    <p className="text-xs text-muted-foreground">Your latest document updates</p>
                  </div>
                  <div className="space-y-3">
                    {['Upload any file type — PDF, images, docs', 'Organize into folders and categories', 'Search by name, category, or tags'].map(
                      (item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm"
                        >
                          <span>{item}</span>
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-3 rounded-3xl border border-white/10 bg-background/50 p-4">
                  <div className="rounded-2xl bg-white/5 px-3 py-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      Storage
                    </p>
                    <p className="mt-2 text-3xl font-semibold">100 MB</p>
                    <p className="text-xs text-muted-foreground">Free storage per account</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-3 py-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      File types
                    </p>
                    <p className="mt-2 text-3xl font-semibold">All</p>
                    <p className="text-xs text-muted-foreground">PDF, images, docs, and more</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
            className={cn('glass-panel surface-outline rounded-[2rem] p-2 sm:p-3')}
          >
            <div className="rounded-[1.6rem] border border-white/10 bg-background/80 p-6 sm:p-8">
              {children}
              {footer ? <div className="mt-6">{footer}</div> : null}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
