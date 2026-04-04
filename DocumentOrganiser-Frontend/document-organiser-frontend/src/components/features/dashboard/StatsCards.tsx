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
      gradient: 'from-violet-500 to-purple-600',
      bgGlow: 'group-hover:shadow-violet-500/25',
    },
    {
      title: 'Total Folders',
      value: stats?.totalFolders ?? 0,
      icon: FolderOpen,
      gradient: 'from-fuchsia-500 to-pink-600',
      bgGlow: 'group-hover:shadow-fuchsia-500/25',
    },
    {
      title: 'Storage Used',
      value: formatFileSize(stats?.storageUsedBytes ?? 0),
      icon: HardDrive,
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'group-hover:shadow-emerald-500/25',
    },
    {
      title: 'Favorites',
      value: stats?.favoriteCount ?? 0,
      icon: Star,
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'group-hover:shadow-amber-500/25',
    },
    {
      title: 'Shared with Me',
      value: stats?.sharedWithMeCount ?? 0,
      icon: Share2,
      gradient: 'from-pink-500 to-rose-600',
      bgGlow: 'group-hover:shadow-pink-500/25',
    },
    {
      title: 'Shared by Me',
      value: stats?.sharedByMeCount ?? 0,
      icon: TrendingUp,
      gradient: 'from-cyan-500 to-blue-600',
      bgGlow: 'group-hover:shadow-cyan-500/25',
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
          whileHover={{ y: -2 }}
          className="group"
        >
          <Card className={`relative overflow-hidden border-white/10 bg-card/80 backdrop-blur-sm transition-all duration-300 ${card.bgGlow} group-hover:shadow-lg group-hover:border-white/20`}>
            {/* Gradient accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
            
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-xl bg-gradient-to-br ${card.gradient} p-2 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                <card.icon className="h-3.5 w-3.5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {isLoading ? (
                  <div className="h-7 w-16 animate-pulse rounded-md bg-muted shimmer" />
                ) : (
                  card.value
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
