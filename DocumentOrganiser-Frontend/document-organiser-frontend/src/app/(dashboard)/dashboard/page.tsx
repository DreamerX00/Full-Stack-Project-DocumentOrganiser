'use client';

import { useDashboardStats } from '@/lib/hooks/useDashboard';
import { StatsCards } from '@/components/features/dashboard/StatsCards';
import { StorageWidget } from '@/components/features/dashboard/StorageWidget';
import { RecentFiles } from '@/components/features/dashboard/RecentFiles';
import { FileTypeChart } from '@/components/features/dashboard/FileTypeChart';
import { ActivityFeed } from '@/components/features/dashboard/ActivityFeed';
import {
  ArrowRight,
  BrainCircuit,
  FolderPlus,
  MessagesSquare,
  Sparkles,
  Star,
  Upload,
  Users2,
  Clock,
  Workflow,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';

const collaborationSignals = [
  {
    title: 'Review queue',
    value: '3 waiting',
    description: 'Approvals, version checkpoints, and unresolved comments.',
    icon: Workflow,
  },
  {
    title: 'Team pulse',
    value: '7 online',
    description: 'Live teammates across contracts, operations, and leadership.',
    icon: Users2,
  },
  {
    title: 'Knowledge seams',
    value: 'AI-ready',
    description: 'Surfaces prepared for semantic search, summaries, and extraction.',
    icon: BrainCircuit,
  },
];

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-panel surface-outline overflow-hidden rounded-[2rem] p-6 sm:p-8"
      >
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-primary/80">
              <Sparkles className="h-3.5 w-3.5" />
              Mission control
            </div>
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                Collaborate across documents, decisions, and shared knowledge.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
                The dashboard is now your premium workspace overview: quick actions, live activity,
                search context, and the next layer of collaboration-ready experiences.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {collaborationSignals.map((signal) => (
                <div key={signal.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <signal.icon className="mb-5 h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">{signal.title}</p>
                  <p className="mt-1 text-2xl font-semibold">{signal.value}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{signal.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[1.7rem] border border-white/10 bg-background/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Quick workspace actions</p>
                <h2 className="mt-2 text-xl font-semibold">Keep work moving</h2>
              </div>
              <MessagesSquare className="h-5 w-5 text-primary" />
            </div>

            <div className="grid gap-3">
              {[
                { icon: Upload, label: 'Upload File', href: '/dashboard/documents' },
                { icon: FolderPlus, label: 'Create Folder', href: '/dashboard/documents' },
                { icon: Star, label: 'Open Favorites', href: '/dashboard/favorites' },
                { icon: Clock, label: 'Review Recent Activity', href: '/dashboard/recent' },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <div className="group flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-primary/8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12">
                        <action.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{action.label}</p>
                        <p className="text-xs text-muted-foreground">Jump straight into the flow</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-primary/80">Operational overview</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Current system health and usage</h2>
      </div>

      <StatsCards stats={stats ?? null} isLoading={isLoading} />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <RecentFiles documents={stats?.recentDocuments ?? []} />
          <FileTypeChart data={stats?.documentsByCategory ?? {}} />
        </div>

        <div className="space-y-6">
          <StorageWidget
            used={stats?.storageUsedBytes ?? 0}
            quota={stats?.storageLimitBytes ?? 104857600}
          />
          <ActivityFeed activities={stats?.recentActivity ?? []} />
          <Card className="border-white/10">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Future layer</p>
                  <h3 className="mt-2 text-xl font-semibold">Workspace expansion</h3>
                </div>
                <Users2 className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-3">
                {[
                  'Team switcher and scoped navigation',
                  'Threads, mentions, and approvals',
                  'Saved views and universal search',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
