'use client';

import { useEffect, useState, use } from 'react';
import { sharesApi } from '@/lib/api/shares';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, AlertTriangle } from 'lucide-react';
import { formatFileSize, downloadBlob } from '@/lib/utils/format';
import { toast } from 'sonner';
import type { PublicShareResponse } from '@/lib/types';

export default function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [share, setShare] = useState<PublicShareResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShare = async () => {
      try {
        const data = await sharesApi.getPublicShare(token);
        setShare(data);
      } catch {
        setError('This share link is invalid or has expired.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchShare();
  }, [token]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await sharesApi.downloadPublicShare(token);
      downloadBlob(blob, share?.itemName ?? 'download');
    } catch {
      toast.error('Failed to download');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-12 w-12 mx-auto rounded-lg" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Link Unavailable</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 rounded-xl bg-primary/10 p-4 w-fit">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-xl">{share?.itemName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Shared by</p>
              <p className="font-medium">{share?.sharedBy}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Size</p>
              <p className="font-medium">{formatFileSize(share?.size ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{share?.contentType ?? 'Unknown'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Permission</p>
              <p className="font-medium capitalize">{share?.permission?.toLowerCase()}</p>
            </div>
          </div>

          {(share?.permission === 'VIEW' || share?.permission === 'DOWNLOAD') && (
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full gap-2"
              size="lg"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Powered by DocOrganiser
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
