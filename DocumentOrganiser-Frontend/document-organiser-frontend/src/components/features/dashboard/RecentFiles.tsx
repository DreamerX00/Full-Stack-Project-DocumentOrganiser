'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { DocumentResponse } from '@/lib/types';
import { formatFileSize, formatRelativeTime, getCategoryInfo } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface RecentFilesProps {
  documents: DocumentResponse[];
}

export function RecentFiles({ documents }: RecentFilesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Recent Files</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/recent" className="gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No recent files
            </p>
          )}
          {documents.slice(0, 5).map((doc) => {
            const info = getCategoryInfo(doc.category);
            const Icon = info.icon;

            return (
              <div key={doc.id} className="flex items-center gap-3">
                <div className={cn('rounded-md p-1.5', info.bgColor)}>
                  <Icon className={cn('h-4 w-4', info.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(doc.size)} · {formatRelativeTime(doc.updatedAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
