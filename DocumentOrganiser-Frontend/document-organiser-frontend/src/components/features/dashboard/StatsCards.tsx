'use client';

import { motion } from 'framer-motion';
import { FileText, FolderOpen, HardDrive, Star, Share2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatFileSize } from '@/lib/utils/format';
import type { DashboardStatsResponse } from '@/lib/types';

interface StatsCardsProps {
  stats: DashboardStatsResponse | null;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Documents',
      value: stats?.totalDocuments ?? 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Total Folders',
      value: stats?.totalFolders ?? 0,
      icon: FolderOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Storage Used',
      value: formatFileSize(stats?.storageUsedBytes ?? 0),
      icon: HardDrive,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Favorites',
      value: stats?.favoriteCount ?? 0,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      title: 'Shared with Me',
      value: stats?.sharedWithMeCount ?? 0,
      icon: Share2,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    },
    {
      title: 'Shared by Me',
      value: stats?.sharedByMeCount ?? 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
        >
        <Card className="border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-2xl p-2 ${card.bgColor}`}>
              <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{isLoading ? '—' : card.value}</div>
          </CardContent>
        </Card>
        </motion.div>
      ))}
    </div>
  );
}
