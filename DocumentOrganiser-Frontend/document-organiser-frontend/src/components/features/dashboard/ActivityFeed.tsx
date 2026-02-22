'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import type { ActivityResponse } from '@/lib/types';

interface ActivityFeedProps {
  activities: ActivityResponse[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
            <Activity className="h-8 w-8" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 8).map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
