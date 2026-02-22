'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock } from 'lucide-react';
import { formatFileSize, formatRelativeTime } from '@/lib/utils/format';
import type { DocumentResponse } from '@/lib/types';
import Link from 'next/link';

interface RecentFilesProps {
  documents: DocumentResponse[];
}

export function RecentFiles({ documents }: RecentFilesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Files</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent files</p>
        ) : (
          <div className="space-y-3">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(doc.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
