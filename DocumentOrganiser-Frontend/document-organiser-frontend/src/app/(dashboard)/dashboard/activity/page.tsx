'use client';

import { useState } from 'react';
import { useActivities } from '@/lib/hooks/useActivity';
import { Card, CardContent } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';

const activityIcons: Record<string, React.ElementType> = {
  DOCUMENT_UPLOADED: Upload,
  DOCUMENT_DOWNLOADED: Download,
  DOCUMENT_VIEWED: Eye,
  DOCUMENT_RENAMED: Edit,
  DOCUMENT_MOVED: Move,
  DOCUMENT_COPIED: Copy,
  DOCUMENT_DELETED: Trash2,
  DOCUMENT_RESTORED: Move,
  DOCUMENT_PERMANENTLY_DELETED: Trash2,
  DOCUMENT_FAVORITED: Star,
  DOCUMENT_UNFAVORITED: Star,
  DOCUMENT_TAGGED: Edit,
  DOCUMENT_UNTAGGED: Edit,
  FOLDER_CREATED: FolderPlus,
  FOLDER_RENAMED: Edit,
  FOLDER_MOVED: Move,
  FOLDER_DELETED: Trash2,
  FOLDER_RESTORED: Move,
  FOLDER_PERMANENTLY_DELETED: Trash2,
  SHARE_CREATED: Share2,
  SHARE_UPDATED: Share2,
  SHARE_REVOKED: Share2,
  SHARE_LINK_CREATED: Share2,
  SHARE_LINK_ACCESSED: Eye,
  SHARE_LINK_REVOKED: Share2,
  USER_LOGIN: Eye,
  USER_LOGOUT: Eye,
  USER_SETTINGS_UPDATED: Edit,
};

const activityColors: Record<string, string> = {
  DOCUMENT_UPLOADED: 'text-green-500 bg-green-500/10',
  DOCUMENT_DOWNLOADED: 'text-blue-500 bg-blue-500/10',
  DOCUMENT_VIEWED: 'text-gray-500 bg-gray-500/10',
  DOCUMENT_RENAMED: 'text-yellow-500 bg-yellow-500/10',
  DOCUMENT_MOVED: 'text-cyan-500 bg-cyan-500/10',
  DOCUMENT_COPIED: 'text-teal-500 bg-teal-500/10',
  DOCUMENT_DELETED: 'text-red-500 bg-red-500/10',
  DOCUMENT_RESTORED: 'text-green-500 bg-green-500/10',
  DOCUMENT_PERMANENTLY_DELETED: 'text-red-700 bg-red-700/10',
  DOCUMENT_FAVORITED: 'text-amber-500 bg-amber-500/10',
  DOCUMENT_UNFAVORITED: 'text-amber-500 bg-amber-500/10',
  DOCUMENT_TAGGED: 'text-indigo-500 bg-indigo-500/10',
  DOCUMENT_UNTAGGED: 'text-indigo-500 bg-indigo-500/10',
  FOLDER_CREATED: 'text-indigo-500 bg-indigo-500/10',
  FOLDER_RENAMED: 'text-yellow-500 bg-yellow-500/10',
  FOLDER_MOVED: 'text-cyan-500 bg-cyan-500/10',
  FOLDER_DELETED: 'text-red-500 bg-red-500/10',
  FOLDER_RESTORED: 'text-green-500 bg-green-500/10',
  FOLDER_PERMANENTLY_DELETED: 'text-red-700 bg-red-700/10',
  SHARE_CREATED: 'text-purple-500 bg-purple-500/10',
  SHARE_UPDATED: 'text-purple-500 bg-purple-500/10',
  SHARE_REVOKED: 'text-purple-500 bg-purple-500/10',
  SHARE_LINK_CREATED: 'text-purple-500 bg-purple-500/10',
  SHARE_LINK_ACCESSED: 'text-purple-500 bg-purple-500/10',
  SHARE_LINK_REVOKED: 'text-purple-500 bg-purple-500/10',
  USER_LOGIN: 'text-green-500 bg-green-500/10',
  USER_LOGOUT: 'text-gray-500 bg-gray-500/10',
  USER_SETTINGS_UPDATED: 'text-blue-500 bg-blue-500/10',
};

export default function ActivityPage() {
  const [filter, setFilter] = useState<string>('all');

  const { data, isLoading } = useActivities(
    filter !== 'all' ? (filter as ActivityType) : undefined,
  );

  const activities = data?.content ?? [];

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
                          {activity.resourceName || ''}
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
