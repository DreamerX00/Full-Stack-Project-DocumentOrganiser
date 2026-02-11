'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDrive } from 'lucide-react';
import { formatFileSize, getStorageColor, getStorageProgressColor } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface StorageWidgetProps {
  used: number;
  quota: number;
}

export function StorageWidget({ used, quota }: StorageWidgetProps) {
  const percentage = Math.round((used / quota) * 100);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Storage</CardTitle>
        <HardDrive className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end gap-1">
          <span className={cn('text-2xl font-bold', getStorageColor(percentage))}>
            {percentage}%
          </span>
          <span className="text-sm text-muted-foreground mb-0.5">used</span>
        </div>
        <Progress
          value={percentage}
          className="h-2"
        />
        <p className="text-xs text-muted-foreground">
          {formatFileSize(used)} of {formatFileSize(quota)} used
        </p>
      </CardContent>
    </Card>
  );
}
