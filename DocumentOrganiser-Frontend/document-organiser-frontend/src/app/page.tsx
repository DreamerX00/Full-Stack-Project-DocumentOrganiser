'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  FileSearch,
  FolderKanban,
  History,
  Layers3,
  LockKeyhole,
  Sparkles,
  Users2,
} from 'lucide-react';
import { AmbientBackdrop } from '@/components/brand/AmbientBackdrop';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const pillars = [
  {
    icon: FolderKanban,
    title: 'Organized spaces',
    description: 'Move from scattered files to structured folders, categories, and favorites.',
  },
  {
    icon: FileSearch,
    title: 'Search with context',
    description: 'Find files by name, content, category, or activity from one intelligent surface.',
  },
  {
    icon: History,
    title: 'Version confidence',
    description: 'Track changes, recover with confidence, and understand what happened across time.',
  },
  {
    icon: LockKeyhole,
    title: 'Secure by default',
    description: 'Your documents are stored securely with per-user isolation and access controls.',
  },
];

const useCases = [
  {
    title: 'Personal documents',
    text: 'Organize contracts, receipts, and important files with smart categorization and instant search.',
  },
  {
    title: 'Work and projects',
    text: 'Keep project documents, specs, and notes structured in folders with full version history.',
  },
  {
    title: 'Knowledge management',
    text: 'Build a personal knowledge base with fast retrieval, favorites, and activity tracking.',
  },
];

const metrics = [
  { value: '100 MB', label: 'free storage per account' },
  { value: 'All types', label: 'PDF, images, docs, and more' },
  { value: 'Instant', label: 'search across your files' },
];

const orchestrationCards = [
  { label: 'Smart categories', icon: FolderKanban, accent: 'from-primary/30 to-cyan-400/10' },
  { label: 'Activity feed', icon: BellRing, accent: 'from-cyan-400/30 to-sky-300/10' },
  { label: 'Sharing & links', icon: Users2, accent: 'from-fuchsia-400/30 to-primary/10' },
  { label: 'Version history', icon: History, accent: 'from-emerald-400/30 to-cyan-300/10' },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-background">
      <AmbientBackdrop intensity="bold" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <Image src="/logo.svg" alt="DocOrganiser" width={24} height={24} className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-sm font-medium uppercase tracking-[0.32em] text-primary/80">
                DocOrganiser
              </span>
              <span className="block text-sm text-muted-foreground">
                Document workspace
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-primary/85 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Your document workspace
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl">
                  A premium workspace for every document you depend on.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Organize, search, and manage your documents with an elegant interface,
                  powerful discovery, version history, and secure storage.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="px-6">
                  <Link href="/register">
                    Get started free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="px-6">
                  <Link href="/login">Sign in to your account</Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="glass-card rounded-3xl border border-white/10 px-4 py-5">
                    <div className="text-3xl font-semibold text-gradient">{metric.value}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{metric.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
              className="glass-panel surface-outline relative rounded-[2rem] p-3 sm:p-5"
            >
              <div className="rounded-[1.6rem] border border-white/10 bg-background/85 p-4 shadow-[var(--shadow-panel)] sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-primary/75">Dashboard preview</p>
                    <h2 className="mt-2 text-2xl font-semibold">Your document workspace</h2>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))] p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {orchestrationCards.map((card, index) => (
                        <motion.div
                          key={card.label}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.15 + index * 0.08 }}
                          className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} p-4`}
                        >
                          <card.icon className="mb-8 h-5 w-5 text-primary" />
                          <p className="text-sm font-medium">{card.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-background/65 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Recent documents</p>
                          <p className="text-xs text-muted-foreground">Your latest uploads</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          'Your uploaded documents appear here',
                          'Organized by category automatically',
                          'Search and find any file instantly',
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium">{item}</p>
                              <p className="text-xs text-muted-foreground">Feature highlight</p>
                            </div>
                            <BadgeCheck className="h-5 w-5 text-primary" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-background/60 p-4">
                    <div className="rounded-[1.5rem] bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Storage</p>
                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-4xl font-semibold">100 MB</span>
                        <span className="text-xs text-emerald-400">free</span>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Categories</p>
                      <div className="mt-4 space-y-3">
                        {['Documents', 'Images', 'Spreadsheets'].map((item) => (
                          <div key={item} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3">
                            <span className="text-sm font-medium">{item}</span>
                            <Layers3 className="h-4 w-4 text-primary" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Activity</p>
                      <p className="mt-3 text-sm text-muted-foreground">Track uploads, downloads, and file changes in real time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="glass-card rounded-[2rem] border border-white/10 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Built for productivity</p>
                <h2 className="mt-2 text-2xl font-semibold">Everything you need to manage your documents</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {['Versioning', 'Search', 'Categories', 'Favorites'].map(
                  (item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.32em] text-primary/80">Product pillars</p>
            <h2 className="mt-3 text-4xl font-semibold">Designed to feel elegant today and extensible tomorrow.</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <Card className="h-full border-white/10">
                  <CardContent className="flex h-full flex-col gap-8 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="border-white/10">
              <CardContent className="space-y-6 p-7">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.28em] text-primary/80">
                  <Users2 className="h-3.5 w-3.5" />
                  Platform overview
                </div>
                <h2 className="text-3xl font-semibold">From file storage to a complete document workspace.</h2>
                <p className="text-muted-foreground">
                  DocOrganiser gives you smart categorization, full-text search, version tracking,
                  and a beautiful interface to keep your documents organized and accessible.
                </p>
                <div className="space-y-3">
                  {[
                    'Smart folder and category organization',
                    'Full-text search across all documents',
                    'Activity feed and version history',
                    'Favorites, recent files, and quick actions',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5 md:grid-cols-3">
              {useCases.map((item) => (
                <Card key={item.title} className="border-white/10">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-[0.26em] text-primary/75">Use case</p>
                    <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-18 text-center sm:px-6 lg:px-8">
          <div className="glass-panel surface-outline rounded-[2rem] px-6 py-12 sm:px-10">
            <p className="text-xs uppercase tracking-[0.32em] text-primary/80">Ready to get organized</p>
            <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
              Start managing your documents with a workspace that works for you.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Sign up free and start uploading, organizing, and searching your documents
              in a beautiful, modern interface.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign in to your account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
