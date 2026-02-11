'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { ActivityResponse } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/format';

interface ActivityFeedProps {
  activities: ActivityResponse[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/activity" className="gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No recent activity
            </p>
          )}
          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
