'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HardDrive } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/format';

interface StorageWidgetProps {
  used: number;
  quota: number;
}

export function StorageWidget({ used, quota }: StorageWidgetProps) {
  const percent = quota > 0 ? Math.round((used / quota) * 100) : 0;

  return (
    <Card className="border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Storage</CardTitle>
        <HardDrive className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={percent} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {formatFileSize(used)} of {formatFileSize(quota)} used ({percent}%)
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Capacity insight</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Workspace-aware quotas and team storage analytics can grow from this foundation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
