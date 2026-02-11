'use client';

import { useEffect, useState } from 'react';
import { activityApi } from '@/lib/api/activity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity as ActivityIcon,
  Upload,
  Download,
  Trash2,
  Edit,
  Share2,
  Star,
  FolderPlus,
  Move,
  Copy,
  Eye,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import { ActivityType } from '@/lib/types';
import type { ActivityResponse } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const activityIcons: Record<string, React.ElementType> = {
  UPLOAD: Upload,
  DOWNLOAD: Download,
  DELETE: Trash2,
  RENAME: Edit,
  SHARE: Share2,
  FAVORITE: Star,
  CREATE_FOLDER: FolderPlus,
  MOVE: Move,
  COPY: Copy,
  VIEW: Eye,
};

const activityColors: Record<string, string> = {
  UPLOAD: 'text-green-500 bg-green-500/10',
  DOWNLOAD: 'text-blue-500 bg-blue-500/10',
  DELETE: 'text-red-500 bg-red-500/10',
  RENAME: 'text-yellow-500 bg-yellow-500/10',
  SHARE: 'text-purple-500 bg-purple-500/10',
  FAVORITE: 'text-amber-500 bg-amber-500/10',
  CREATE_FOLDER: 'text-indigo-500 bg-indigo-500/10',
  MOVE: 'text-cyan-500 bg-cyan-500/10',
  COPY: 'text-teal-500 bg-teal-500/10',
  VIEW: 'text-gray-500 bg-gray-500/10',
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const data = await activityApi.list(
          filter !== 'all' ? (filter as ActivityType) : undefined
        );
        setActivities(data.content);
      } catch {
        toast.error('Failed to load activity');
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, [filter]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-muted-foreground">Your recent activity log</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            {Object.values(ActivityType).map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ActivityIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No activity yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your activity will appear here as you use the app.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.activityType] || ActivityIcon;
              const colorClass = activityColors[activity.activityType] || 'text-gray-500 bg-gray-500/10';

              return (
                <div key={activity.id} className="relative flex gap-4 pl-0">
                  <div
                    className={cn(
                      'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      colorClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <Card className="flex-1">
                    <CardContent className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.itemName || ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.activityType.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(activity.createdAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
