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
    <Card className="border-white/10">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Files</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent files</p>
        ) : (
          <div className="space-y-3">
            {documents.slice(0, 5).map((doc) => (
              <Link
                href="/dashboard/documents"
                key={doc.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-primary/8"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(doc.updatedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
