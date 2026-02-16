'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { sharesApi } from '@/lib/api/shares';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { Download, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { formatFileSize, downloadBlob, getCategoryInfo } from '@/lib/utils/format';
import {
  getPreviewType,
  needsTextContent,
  getLanguageLabel,
  parseCSV,
  renderMarkdownToHtml,
  type PreviewType,
} from '@/lib/utils/preview';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { DocumentResponse } from '@/lib/types';

// Max file size (in bytes) to auto-load preview content
const AUTO_PREVIEW_LIMIT = 15 * 1024 * 1024; // 15 MB

export default function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [doc, setDoc] = useState<DocumentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const previewType: PreviewType = doc
    ? getPreviewType(doc.mimeType, doc.name)
    : 'fallback';

  const canPreview = previewType !== 'fallback' && previewType !== 'office';

  useEffect(() => {
    const fetchShare = async () => {
      try {
        const data = await sharesApi.getPublicShare(token);
        setDoc(data);
        // Auto-show preview for small previewable files
        const type = getPreviewType(data.mimeType, data.name);
        if (type !== 'fallback' && type !== 'office' && data.fileSize <= AUTO_PREVIEW_LIMIT) {
          setShowPreview(true);
        }
      } catch {
        setError('This share link is invalid or has expired.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchShare();
  }, [token]);

  // Load preview content when toggled on
  useEffect(() => {
    if (!showPreview || !doc || previewBlobUrl || previewText) return;

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);

    sharesApi
      .downloadPublicShare(token)
      .then(async (blob: Blob) => {
        if (cancelled) return;
        if (needsTextContent(previewType)) {
          const text = await blob.text();
          if (!cancelled) setPreviewText(text);
        } else {
          const url = URL.createObjectURL(blob);
          if (!cancelled) setPreviewBlobUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) setPreviewError('Failed to load preview');
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showPreview, doc, token, previewType, previewBlobUrl, previewText]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    };
  }, [previewBlobUrl]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await sharesApi.downloadPublicShare(token);
      downloadBlob(blob, doc?.originalName ?? doc?.name ?? 'download');
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

  const categoryInfo = doc ? getCategoryInfo(doc.category) : null;
  const CategoryIcon = categoryInfo?.icon;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className={cn('w-full', showPreview && canPreview ? 'max-w-3xl' : 'max-w-md')}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 rounded-xl bg-primary/10 p-4 w-fit">
            <Image src="/logo.svg" alt="DocOrganiser" width={40} height={40} className="h-10 w-10" />
          </div>
          <CardTitle className="text-xl">{doc?.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Size</p>
              <p className="font-medium">{formatFileSize(doc?.fileSize ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{doc?.mimeType ?? 'Unknown'}</p>
            </div>
          </div>

          {/* Preview section */}
          {canPreview && (
            <>
              <Separator />
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => setShowPreview((v) => !v)}
                >
                  {showPreview ? (
                    <><EyeOff className="h-4 w-4" /> Hide Preview</>
                  ) : (
                    <><Eye className="h-4 w-4" /> Preview</>
                  )}
                </Button>

                {showPreview && (
                  <div className="rounded-lg border overflow-hidden">
                    {previewLoading ? (
                      <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Loading preview…</p>
                      </div>
                    ) : previewError ? (
                      <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                        <p className="text-xs">{previewError}</p>
                      </div>
                    ) : (
                      <SharePreviewContent
                        type={previewType}
                        blobUrl={previewBlobUrl}
                        textContent={previewText}
                        doc={doc!}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full gap-2"
            size="lg"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Powered by DocOrganiser
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Share page inline previewer                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

function SharePreviewContent({
  type,
  blobUrl,
  textContent,
  doc,
}: {
  type: PreviewType;
  blobUrl: string | null;
  textContent: string | null;
  doc: DocumentResponse;
}) {
  switch (type) {
    case 'image':
      return blobUrl ? (
        <div className="flex items-center justify-center bg-muted/30 max-h-[50vh] overflow-auto p-2">
          <img src={blobUrl} alt={doc.name} className="max-w-full max-h-[48vh] object-contain rounded" />
        </div>
      ) : null;

    case 'pdf':
      return blobUrl ? (
        <iframe src={blobUrl} className="w-full h-[50vh]" title={doc.name} />
      ) : null;

    case 'video':
      return blobUrl ? (
        <video src={blobUrl} controls playsInline className="w-full max-h-[50vh] bg-black">
          Your browser does not support the video tag.
        </video>
      ) : null;

    case 'audio':
      return blobUrl ? (
        <div className="flex items-center justify-center p-6">
          <audio src={blobUrl} controls className="w-full max-w-md">
            Your browser does not support the audio tag.
          </audio>
        </div>
      ) : null;

    case 'code':
      return textContent !== null ? (
        <ShareCodePreview content={textContent} fileName={doc.name} />
      ) : null;

    case 'csv':
      return textContent !== null ? (
        <ShareCsvPreview content={textContent} />
      ) : null;

    case 'markdown':
      return textContent !== null ? (
        <ShareMarkdownPreview content={textContent} />
      ) : null;

    default:
      return null;
  }
}

function ShareCodePreview({ content, fileName }: { content: string; fileName: string }) {
  const lines = content.split('\n').slice(0, 200); // Limit to 200 lines for share page
  const lang = getLanguageLabel(fileName);
  const gutterWidth = String(lines.length).length;

  return (
    <div>
      <div className="bg-muted/50 px-3 py-1.5 border-b flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px] font-mono">{lang}</Badge>
      </div>
      <ScrollArea className="max-h-[40vh]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono leading-relaxed">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-muted/40">
                  <td
                    className="sticky left-0 bg-muted/30 text-muted-foreground text-right select-none px-2 py-0 border-r"
                    style={{ minWidth: `${gutterWidth + 2}ch` }}
                  >
                    {i + 1}
                  </td>
                  <td className="px-3 py-0 whitespace-pre">{line || ' '}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}

function ShareCsvPreview({ content }: { content: string }) {
  const allRows = parseCSV(content);
  const headers = allRows[0] ?? [];
  const body = allRows.slice(1, 51); // Show first 50 rows
  const maxCols = Math.max(...allRows.map((r) => r.length), 1);

  return (
    <ScrollArea className="max-h-[40vh]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-10 text-center text-xs font-mono">#</TableHead>
              {headers.map((h, i) => (
                <TableHead key={i} className="text-xs font-semibold">{h || `Col ${i + 1}`}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {body.map((row, ri) => (
              <TableRow key={ri}>
                <TableCell className="text-center text-xs text-muted-foreground font-mono">{ri + 1}</TableCell>
                {Array.from({ length: maxCols }).map((_, ci) => (
                  <TableCell key={ci} className="text-xs">{row[ci] ?? ''}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
}

function ShareMarkdownPreview({ content }: { content: string }) {
  const html = renderMarkdownToHtml(content);
  return (
    <ScrollArea className="max-h-[40vh]">
      <div
        className="prose prose-sm dark:prose-invert max-w-none p-4
          [&_.preview-code-block]:bg-muted [&_.preview-code-block]:rounded-md [&_.preview-code-block]:p-3 [&_.preview-code-block]:overflow-x-auto [&_.preview-code-block]:text-xs [&_.preview-code-block]:font-mono
          [&_.preview-inline-code]:bg-muted [&_.preview-inline-code]:px-1 [&_.preview-inline-code]:py-0.5 [&_.preview-inline-code]:rounded [&_.preview-inline-code]:text-xs [&_.preview-inline-code]:font-mono
          [&_.preview-link]:text-primary [&_.preview-link]:underline
          [&_.preview-blockquote]:border-l-4 [&_.preview-blockquote]:border-muted-foreground/30 [&_.preview-blockquote]:pl-4 [&_.preview-blockquote]:italic
          [&_.preview-list]:list-disc [&_.preview-list]:pl-6 [&_ol.preview-list]:list-decimal
          [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3
          [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2
          [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2
          [&_p]:mb-2 [&_p]:leading-relaxed
          [&_hr]:my-4 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </ScrollArea>
  );
}
