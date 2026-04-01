'use client';

import { useDashboardStats } from '@/lib/hooks/useDashboard';
import { StatsCards } from '@/components/features/dashboard/StatsCards';
import { StorageWidget } from '@/components/features/dashboard/StorageWidget';
import { RecentFiles } from '@/components/features/dashboard/RecentFiles';
import { FileTypeChart } from '@/components/features/dashboard/FileTypeChart';
import { ActivityFeed } from '@/components/features/dashboard/ActivityFeed';
import {
  ArrowRight,
  Clock,
  FileText,
  FolderPlus,
  HardDrive,
  MessagesSquare,
  Share2,
  Sparkles,
  Star,
  Upload,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const user = useAuthStore((s) => s.user);

  const signalCards = [
    { label: 'Documents', value: stats?.totalDocuments ?? 0, icon: FileText },
    { label: 'Favorites', value: stats?.favoriteCount ?? 0, icon: Star },
    { label: 'Storage', value: `${stats?.storageUsedPercentage ?? 0}%`, icon: HardDrive },
    { label: 'Shared', value: stats?.sharedWithMeCount ?? 0, icon: Share2 },
  ];

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
                Welcome back{user?.name ? `, ${user.name}` : ''}.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
                {isLoading
                  ? 'Loading your workspace...'
                  : `${stats?.totalDocuments ?? 0} documents · ${stats?.totalFolders ?? 0} folders · ${stats?.storageUsedPercentage ?? 0}% storage used`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                  ))
                : signalCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <card.icon className="mb-2 h-4 w-4 text-primary" />
                      <p className="text-2xl font-semibold">{card.value}</p>
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                    </div>
                  ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[1.7rem] border border-white/10 bg-background/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Quick actions</p>
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
        </div>
      </div>
    </div>
  );
}
