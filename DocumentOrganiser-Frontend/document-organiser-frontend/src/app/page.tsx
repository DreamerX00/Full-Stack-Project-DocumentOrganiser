'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Bot,
  FileSearch,
  FolderKanban,
  History,
  Layers3,
  LockKeyhole,
  MessagesSquare,
  Sparkles,
  Users2,
  Workflow,
} from 'lucide-react';
import { AmbientBackdrop } from '@/components/brand/AmbientBackdrop';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const pillars = [
  {
    icon: FolderKanban,
    title: 'Collaborative spaces',
    description: 'Move from isolated folders to workspace-driven teams, projects, and review hubs.',
  },
  {
    icon: FileSearch,
    title: 'Search with context',
    description: 'Find files, comments, approvals, and knowledge trails from one intelligent surface.',
  },
  {
    icon: History,
    title: 'Version confidence',
    description: 'Track changes, recover with confidence, and understand what happened across time.',
  },
  {
    icon: LockKeyhole,
    title: 'Governed sharing',
    description: 'Deliver elegant collaboration without sacrificing security, policy, or auditability.',
  },
];

const useCases = [
  {
    title: 'Legal and compliance',
    text: 'Review contracts, retain approvals, and surface governance signals without the friction of legacy DMS tools.',
  },
  {
    title: 'Product and operations',
    text: 'Turn specs, research, invoices, and process docs into a shared operational workspace with fast retrieval.',
  },
  {
    title: 'Executive knowledge',
    text: 'Create a premium decision center for mission-critical documents, comment threads, and activity intelligence.',
  },
];

const metrics = [
  { value: '24/7', label: 'workspace visibility' },
  { value: '12+', label: 'document workflows supported' },
  { value: '1 source', label: 'of truth for teams' },
];

const orchestrationCards = [
  { label: 'Live approvals', icon: Workflow, accent: 'from-primary/30 to-cyan-400/10' },
  { label: 'Comment threads', icon: MessagesSquare, accent: 'from-cyan-400/30 to-sky-300/10' },
  { label: 'AI-ready seams', icon: Bot, accent: 'from-fuchsia-400/30 to-primary/10' },
  { label: 'Activity pulse', icon: BellRing, accent: 'from-emerald-400/30 to-cyan-300/10' },
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
                Collaborative document intelligence
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Launch Workspace
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
                Next-grade workspace redesign
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl">
                  A premium command center for every document your team depends on.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Transform simple file storage into a futuristic collaboration platform with elegant
                  motion, powerful discovery, version confidence, and enterprise-ready control.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="px-6">
                  <Link href="/register">
                    Start in the new workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="px-6">
                  <Link href="/login">Explore existing account</Link>
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
                    <p className="text-xs uppercase tracking-[0.32em] text-primary/75">Mission control</p>
                    <h2 className="mt-2 text-2xl font-semibold">Contracts and governance workspace</h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-muted-foreground">
                    7 collaborators live
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
                          <p className="text-sm font-medium">Review queue</p>
                          <p className="text-xs text-muted-foreground">Approvals, comments, and file state</p>
                        </div>
                        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] text-primary">
                          3 pending
                        </span>
                      </div>
                      <div className="space-y-3">
                        {[
                          'Master Service Agreement v12',
                          'Quarterly finance pack',
                          'Retention policy handbook',
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium">{item}</p>
                              <p className="text-xs text-muted-foreground">Awaiting final approval</p>
                            </div>
                            <BadgeCheck className="h-5 w-5 text-primary" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-background/60 p-4">
                    <div className="rounded-[1.5rem] bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Search velocity</p>
                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-4xl font-semibold">81%</span>
                        <span className="text-xs text-emerald-400">up from last month</span>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Pinned workspaces</p>
                      <div className="mt-4 space-y-3">
                        {['Board room', 'Finance ops', 'People and legal'].map((item) => (
                          <div key={item} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3">
                            <span className="text-sm font-medium">{item}</span>
                            <Layers3 className="h-4 w-4 text-primary" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Presence</p>
                      <div className="mt-4 flex -space-x-2">
                        {['AL', 'NV', 'SK', 'PM'].map((member) => (
                          <div
                            key={member}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-background bg-primary/20 text-xs font-medium text-primary"
                          >
                            {member}
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">Live collaboration indicators and comments are first-class.</p>
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
                <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Built for serious teams</p>
                <h2 className="mt-2 text-2xl font-semibold">A shared system for content, collaboration, and control</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {['Versioning', 'Live comments', 'Policy-aware sharing', 'Workspace analytics'].map(
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
                  Collaboration horizon
                </div>
                <h2 className="text-3xl font-semibold">From file storage to a future-facing collaboration system.</h2>
                <p className="text-muted-foreground">
                  The redesign lays the foundation for workspaces, approvals, activity intelligence,
                  role-aware sharing, and AI-ready experiences without compromising the existing backend.
                </p>
                <div className="space-y-3">
                  {[
                    'Workspace and team switcher',
                    'Document threads, mentions, assignments',
                    'Universal search across files, people, and activity',
                    'Governance views, retention controls, and audit signals',
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
            <p className="text-xs uppercase tracking-[0.32em] text-primary/80">Ready to upgrade the experience</p>
            <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
              Launch a more elegant document workspace for every team.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Start with the redesigned product surface today, then grow into workspaces, approvals,
              collaboration, and knowledge intelligence on the same foundation.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign in to existing workspace</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
