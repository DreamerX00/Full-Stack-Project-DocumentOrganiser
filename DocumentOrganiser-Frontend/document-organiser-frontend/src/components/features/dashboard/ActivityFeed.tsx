'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Upload, Download, Trash2, Edit, Share2, FolderPlus, Star, Eye } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import type { ActivityResponse } from '@/lib/types';

interface ActivityFeedProps {
  activities: ActivityResponse[];
}

const getActivityIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('upload') || actionLower.includes('create')) return { icon: Upload, gradient: 'from-emerald-500 to-teal-600' };
  if (actionLower.includes('download')) return { icon: Download, gradient: 'from-cyan-500 to-blue-600' };
  if (actionLower.includes('delete') || actionLower.includes('trash')) return { icon: Trash2, gradient: 'from-red-500 to-rose-600' };
  if (actionLower.includes('edit') || actionLower.includes('update') || actionLower.includes('rename')) return { icon: Edit, gradient: 'from-amber-500 to-orange-600' };
  if (actionLower.includes('share')) return { icon: Share2, gradient: 'from-pink-500 to-rose-600' };
  if (actionLower.includes('folder')) return { icon: FolderPlus, gradient: 'from-violet-500 to-purple-600' };
  if (actionLower.includes('favorite') || actionLower.includes('star')) return { icon: Star, gradient: 'from-amber-400 to-yellow-500' };
  if (actionLower.includes('view') || actionLower.includes('preview')) return { icon: Eye, gradient: 'from-slate-500 to-gray-600' };
  return { icon: Activity, gradient: 'from-violet-500 to-purple-600' };
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-white/10 bg-card/80 backdrop-blur-sm">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500" />
        
        <CardHeader className="pt-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-violet-500" />
              </div>
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground">Your actions will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.slice(0, 8).map((activity, idx) => {
                const { icon: Icon, gradient } = getActivityIcon(activity.activityType);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.25 }}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm transition-colors hover:bg-white/10"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
