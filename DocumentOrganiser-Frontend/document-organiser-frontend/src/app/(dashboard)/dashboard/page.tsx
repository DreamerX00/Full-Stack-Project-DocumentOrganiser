'use client';

import { useDashboardStats } from '@/lib/hooks/useDashboard';
import { StatsCards } from '@/components/features/dashboard/StatsCards';
import { StorageWidget } from '@/components/features/dashboard/StorageWidget';
import { RecentFiles } from '@/components/features/dashboard/RecentFiles';
import { FileTypeChart } from '@/components/features/dashboard/FileTypeChart';
import { ActivityFeed } from '@/components/features/dashboard/ActivityFeed';
import { Upload, FolderPlus, Star, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your documents.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats ?? null} isLoading={isLoading} />

      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { icon: Upload, label: 'Upload File', href: '/dashboard/documents' },
          { icon: FolderPlus, label: 'New Folder', href: '/dashboard/documents' },
          { icon: Star, label: 'Favorites', href: '/dashboard/favorites' },
          { icon: Clock, label: 'Recent', href: '/dashboard/recent' },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <action.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Files */}
          <RecentFiles documents={stats?.recentDocuments ?? []} />

          {/* File Type Distribution */}
          <FileTypeChart data={stats?.documentsByCategory ?? {}} />
        </div>

        <div className="space-y-6">
          {/* Storage Widget */}
          <StorageWidget
            used={stats?.storageUsedBytes ?? 0}
            quota={stats?.storageLimitBytes ?? 104857600}
          />

          {/* Activity Feed */}
          <ActivityFeed activities={stats?.recentActivity ?? []} />
        </div>
      </div>
    </div>
  );
}
