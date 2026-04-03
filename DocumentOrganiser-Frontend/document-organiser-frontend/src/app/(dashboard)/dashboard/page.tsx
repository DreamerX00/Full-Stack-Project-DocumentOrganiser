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
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const user = useAuthStore((s) => s.user);

  const signalCards = [
    { label: 'Documents', value: stats?.totalDocuments ?? 0, icon: FileText, color: 'from-violet-500 to-purple-600' },
    { label: 'Favorites', value: stats?.favoriteCount ?? 0, icon: Star, color: 'from-amber-500 to-orange-500' },
    { label: 'Storage', value: `${stats?.storageUsedPercentage ?? 0}%`, icon: HardDrive, color: 'from-emerald-500 to-teal-500' },
    { label: 'Shared', value: stats?.sharedWithMeCount ?? 0, icon: Share2, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container-wide space-y-8 py-6 px-4 sm:px-6 lg:px-8"
    >
      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2rem] border border-white/10"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-emerald-600/10" />
        
        {/* Floating orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-20 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative glass-panel p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-violet-400"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Mission control
              </motion.div>
              
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
                >
                  <span className="text-gradient-primary">Welcome back</span>
                  {user?.name ? <>, <span className="text-foreground">{user.name}</span></> : ''}.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground lg:text-lg"
                >
                  {isLoading
                    ? 'Loading your workspace...'
                    : `${stats?.totalDocuments ?? 0} documents · ${stats?.totalFolders ?? 0} folders · ${stats?.storageUsedPercentage ?? 0}% storage used`}
                </motion.p>
              </div>

              {/* Signal Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/5 shimmer" />
                    ))
                  : signalCards.map((card, index) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                      >
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${card.color} blur-xl`} style={{ opacity: 0.1 }} />
                        <div className="relative">
                          <div className={`inline-flex rounded-xl bg-gradient-to-br ${card.color} p-2 mb-3`}>
                            <card.icon className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-2xl font-bold lg:text-3xl">{card.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                        </div>
                      </motion.div>
                    ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-y-4 rounded-[1.7rem] border border-white/10 bg-background/60 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Quick actions</p>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold">Keep work moving</h2>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  { icon: Upload, label: 'Upload File', desc: 'Add new documents', href: '/dashboard/documents', gradient: 'from-violet-500 to-purple-600' },
                  { icon: FolderPlus, label: 'Create Folder', desc: 'Organize your files', href: '/dashboard/documents', gradient: 'from-emerald-500 to-teal-500' },
                  { icon: Star, label: 'Open Favorites', desc: 'Quick access to starred', href: '/dashboard/favorites', gradient: 'from-amber-500 to-orange-500' },
                  { icon: Clock, label: 'Recent Activity', desc: 'Review your history', href: '/dashboard/recent', gradient: 'from-pink-500 to-rose-500' },
                ].map((action, index) => (
                  <motion.div
                    key={action.label}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Link href={action.href}>
                      <div className="group flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3 transition-all hover:border-white/20 hover:bg-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient}`}>
                            <action.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{action.label}</p>
                            <p className="text-xs text-muted-foreground">{action.desc}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Section Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-violet-500">Operational overview</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Current system health and usage</h2>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatsCards stats={stats ?? null} isLoading={isLoading} />
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <motion.div variants={itemVariants} className="space-y-6">
          <RecentFiles documents={stats?.recentDocuments ?? []} />
          <FileTypeChart data={stats?.documentsByCategory ?? {}} />
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <StorageWidget
            used={stats?.storageUsedBytes ?? 0}
            quota={stats?.storageLimitBytes ?? 104857600}
          />
          <ActivityFeed activities={stats?.recentActivity ?? []} />
        </motion.div>
      </div>
    </motion.div>
  );
}
