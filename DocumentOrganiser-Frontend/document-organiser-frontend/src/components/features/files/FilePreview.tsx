'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Download,
  Share2,
  Star,
  Info,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Loader2,
  AlertCircle,
  FileWarning,
} from 'lucide-react';
import {
  formatFileSize,
  formatDate,
  getCategoryInfo,
  copyToClipboard,
} from '@/lib/utils/format';
import {
  getPreviewType,
  needsTextContent,
  getLanguageLabel,
  parseCSV,
  renderMarkdownToHtml,
  type PreviewType,
} from '@/lib/utils/preview';
import { documentsApi } from '@/lib/api/documents';
import type { DocumentResponse } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Props                                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

interface FilePreviewProps {
  document: DocumentResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (doc: DocumentResponse) => void;
  onShare?: (doc: DocumentResponse) => void;
  onToggleFavorite?: (doc: DocumentResponse) => void;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Main Component                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

export function FilePreview({
  document: doc,
  open,
  onOpenChange,
  onDownload,
  onShare,
  onToggleFavorite,
}: FilePreviewProps) {
  // ── State ──────────────────────────────────────────────────────────────
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Derived
  const previewType: PreviewType = doc
    ? getPreviewType(doc.mimeType, doc.name)
    : 'fallback';

  const categoryInfo = doc ? getCategoryInfo(doc.category) : null;
  const CategoryIcon = categoryInfo?.icon;

  // ── Fetch preview URL ──────────────────────────────────────────────────
  useEffect(() => {
    if (!doc || !open) return;

    let cancelled = false;
    setPreviewUrl(null);
    setTextContent(null);
    setError(null);
    setZoom(1);
    setLoadingUrl(true);

    documentsApi
      .getPreviewUrl(doc.id)
      .then((url) => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load preview URL');
      })
      .finally(() => {
        if (!cancelled) setLoadingUrl(false);
      });

    return () => {
      cancelled = true;
    };
  }, [doc, open]);

  // ── Fetch text content for code / csv / markdown ───────────────────────
  useEffect(() => {
    if (!doc || !open || !needsTextContent(previewType)) return;

    let cancelled = false;
    setLoadingContent(true);

    documentsApi
      .download(doc.id)
      .then(async (blob: Blob) => {
        const text = await blob.text();
        if (!cancelled) setTextContent(text);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load file content');
      })
      .finally(() => {
        if (!cancelled) setLoadingContent(false);
      });

    return () => {
      cancelled = true;
    };
  }, [doc, open, previewType]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const openInNewTab = useCallback(() => {
    if (previewUrl) window.open(previewUrl, '_blank', 'noopener');
  }, [previewUrl]);

  const isLoading = loadingUrl || loadingContent;

  // ── Guard ──────────────────────────────────────────────────────────────
  if (!doc) return null;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 truncate pr-8">
            {CategoryIcon && (
              <CategoryIcon
                className={cn('h-5 w-5 shrink-0', categoryInfo?.color)}
              />
            )}
            <span className="truncate">{doc.name}</span>
            <Badge variant="outline" className="ml-2 text-[10px] shrink-0">
              {formatFileSize(doc.fileSize)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* ── Toolbar ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 px-6 py-2 flex-wrap">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onDownload?.(doc)}
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download file</TooltipContent>
            </Tooltip>

            {onShare && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => onShare(doc)}
                  >
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share file</TooltipContent>
              </Tooltip>
            )}

            {onToggleFavorite && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => onToggleFavorite(doc)}
                  >
                    <Star
                      className={cn(
                        'h-3.5 w-3.5',
                        doc.isFavorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground',
                      )}
                    />
                    {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle favorite</TooltipContent>
              </Tooltip>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Image zoom controls */}
            {previewType === 'image' && previewUrl && (
              <div className="flex items-center gap-0.5 border rounded-md px-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setZoom((z) => Math.max(0.25, z - 0.25))
                      }
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom out</TooltipContent>
                </Tooltip>
                <span className="text-xs text-muted-foreground w-10 text-center select-none">
                  {Math.round(zoom * 100)}%
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setZoom((z) => Math.min(5, z + 0.25))
                      }
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom in</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setZoom(1)}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset zoom</TooltipContent>
                </Tooltip>
              </div>
            )}

            {previewUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={openInNewTab}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open in new tab</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowDetails((v) => !v)}
                >
                  <Info
                    className={cn(
                      'h-3.5 w-3.5',
                      showDetails && 'text-primary',
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>File details</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator />

        {/* ── Body ───────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview area */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {isLoading ? (
                <PreviewSkeleton type={previewType} />
              ) : error ? (
                <PreviewError
                  message={error}
                  onRetry={() => {
                    setError(null);
                    setPreviewUrl(null);
                    setTextContent(null);
                    setLoadingUrl(true);
                    documentsApi
                      .getPreviewUrl(doc.id)
                      .then(setPreviewUrl)
                      .catch(() => setError('Could not load preview'))
                      .finally(() => setLoadingUrl(false));
                  }}
                  onDownload={() => onDownload?.(doc)}
                />
              ) : (
                <PreviewRenderer
                  type={previewType}
                  previewUrl={previewUrl}
                  textContent={textContent}
                  doc={doc}
                  zoom={zoom}
                  onZoom={setZoom}
                  onDownload={() => onDownload?.(doc)}
                  categoryInfo={categoryInfo}
                />
              )}
            </div>
          </ScrollArea>

          {/* Details sidebar */}
          {showDetails && (
            <div className="w-64 border-l p-4 space-y-4 overflow-y-auto shrink-0">
              <DetailField label="Type" value={categoryInfo?.label ?? 'Unknown'} />
              <DetailField label="Size" value={formatFileSize(doc.fileSize)} />
              <DetailField label="Content Type" value={doc.mimeType} mono />
              <DetailField label="Created" value={formatDate(doc.createdAt)} />
              <DetailField label="Modified" value={formatDate(doc.updatedAt)} />
              {doc.folderPath && (
                <DetailField label="Folder" value={doc.folderPath} />
              )}
              {doc.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <DetailField label="Version" value={`v${doc.version}`} />
              <DetailField label="Downloads" value={String(doc.downloadCount)} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Sub-components                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

// ── Detail field ─────────────────────────────────────────────────────────────

function DetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase">
        {label}
      </p>
      <p className={cn('text-sm break-all', mono && 'font-mono text-xs')}>
        {value}
      </p>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────────────────

function PreviewSkeleton({ type }: { type: PreviewType }) {
  if (type === 'audio') {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-10 w-full max-w-md rounded-full" />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-[55vh] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading preview…</p>
    </div>
  );
}

// ── Error state ──────────────────────────────────────────────────────────────

function PreviewError({
  message,
  onRetry,
  onDownload,
}: {
  message: string;
  onRetry: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
      <AlertCircle className="h-12 w-12 text-destructive/60" />
      <p className="text-sm">{message}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onDownload}>
          <Download className="h-3.5 w-3.5" /> Download instead
        </Button>
      </div>
    </div>
  );
}

// ── Preview renderer (delegates to type-specific renderers) ──────────────────

function PreviewRenderer({
  type,
  previewUrl,
  textContent,
  doc,
  zoom,
  onZoom,
  onDownload,
  categoryInfo,
}: {
  type: PreviewType;
  previewUrl: string | null;
  textContent: string | null;
  doc: DocumentResponse;
  zoom: number;
  onZoom: (z: number) => void;
  onDownload: () => void;
  categoryInfo: ReturnType<typeof getCategoryInfo> | null;
}) {
  // No URL at all → fallback (unless it's a text-content type)
  if (!previewUrl && type !== 'code' && type !== 'csv' && type !== 'markdown') {
    return <FallbackPreview doc={doc} onDownload={onDownload} categoryInfo={categoryInfo} />;
  }

  switch (type) {
    case 'image':
      return <ImagePreview src={previewUrl!} alt={doc.name} zoom={zoom} onZoom={onZoom} />;
    case 'pdf':
      return <PdfPreview src={previewUrl!} title={doc.name} />;
    case 'video':
      return <VideoPreview src={previewUrl!} />;
    case 'audio':
      return <AudioPreview src={previewUrl!} categoryInfo={categoryInfo} />;
    case 'office':
      return <OfficePreview src={previewUrl!} title={doc.name} onDownload={onDownload} />;
    case 'code':
      return textContent !== null ? (
        <CodePreview content={textContent} fileName={doc.name} />
      ) : (
        <FallbackPreview doc={doc} onDownload={onDownload} categoryInfo={categoryInfo} />
      );
    case 'csv':
      return textContent !== null ? (
        <CsvPreview content={textContent} />
      ) : (
        <FallbackPreview doc={doc} onDownload={onDownload} categoryInfo={categoryInfo} />
      );
    case 'markdown':
      return textContent !== null ? (
        <MarkdownPreview content={textContent} />
      ) : (
        <FallbackPreview doc={doc} onDownload={onDownload} categoryInfo={categoryInfo} />
      );
    default:
      return <FallbackPreview doc={doc} onDownload={onDownload} categoryInfo={categoryInfo} />;
  }
}

// ── Image preview with zoom ──────────────────────────────────────────────────

function ImagePreview({
  src,
  alt,
  zoom,
  onZoom,
}: {
  src: string;
  alt: string;
  zoom: number;
  onZoom: (z: number) => void;
}) {
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        onZoom(Math.max(0.25, Math.min(5, zoom + delta)));
      }
    },
    [zoom, onZoom],
  );

  return (
    <div
      className="flex items-center justify-center overflow-auto rounded-lg bg-muted/30 max-h-[62vh]"
      onWheel={handleWheel}
    >
      <img
        src={src}
        alt={alt}
        className="transition-transform duration-150 ease-out select-none"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          maxWidth: zoom <= 1 ? '100%' : 'none',
          maxHeight: zoom <= 1 ? '60vh' : 'none',
        }}
        draggable={false}
      />
    </div>
  );
}

// ── PDF preview ──────────────────────────────────────────────────────────────

function PdfPreview({ src, title }: { src: string; title: string }) {
  return (
    <iframe
      src={src}
      className="w-full h-[62vh] rounded-lg border"
      title={title}
    />
  );
}

// ── Video preview ────────────────────────────────────────────────────────────

function VideoPreview({ src }: { src: string }) {
  return (
    <video
      src={src}
      controls
      className="w-full max-h-[62vh] rounded-lg bg-black"
      playsInline
    >
      Your browser does not support the video tag.
    </video>
  );
}

// ── Audio preview ────────────────────────────────────────────────────────────

function AudioPreview({
  src,
  categoryInfo,
}: {
  src: string;
  categoryInfo: ReturnType<typeof getCategoryInfo> | null;
}) {
  const Icon = categoryInfo?.icon;
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-6">
      {Icon && (
        <div className={cn('rounded-full p-6', categoryInfo?.bgColor)}>
          <Icon className={cn('h-12 w-12', categoryInfo?.color)} />
        </div>
      )}
      <audio src={src} controls className="w-full max-w-md">
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
}

// ── Office document preview (Google Docs Viewer) ─────────────────────────────

function OfficePreview({
  src,
  title,
  onDownload,
}: {
  src: string;
  title: string;
  onDownload: () => void;
}) {
  const [iframeError, setIframeError] = useState(false);
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(src)}&embedded=true`;

  if (iframeError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <FileWarning className="h-12 w-12" />
        <p className="text-sm text-center max-w-md">
          The document viewer could not load this file.
          <br />
          Download it to view in your local application.
        </p>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onDownload}>
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ExternalLink className="h-3 w-3" />
        Rendered by Google Docs Viewer
      </div>
      <iframe
        src={viewerUrl}
        className="w-full h-[62vh] rounded-lg border"
        title={title}
        onError={() => setIframeError(true)}
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}

// ── Code / text preview ──────────────────────────────────────────────────────

function CodePreview({
  content,
  fileName,
}: {
  content: string;
  fileName: string;
}) {
  const lines = content.split('\n');
  const lang = getLanguageLabel(fileName);
  const lineCount = lines.length;
  const gutterWidth = String(lineCount).length;

  const handleCopy = async () => {
    const ok = await copyToClipboard(content);
    if (ok) toast.success('Copied to clipboard');
    else toast.error('Failed to copy');
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] font-mono">
            {lang}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {lineCount.toLocaleString()} line{lineCount !== 1 ? 's' : ''}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5 h-7" onClick={handleCopy}>
          <Copy className="h-3 w-3" /> Copy
        </Button>
      </div>

      {/* Code */}
      <ScrollArea className="max-h-[58vh]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono leading-relaxed">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-muted/40">
                  <td
                    className="sticky left-0 bg-muted/30 text-muted-foreground text-right select-none px-3 py-0 border-r"
                    style={{ minWidth: `${gutterWidth + 2}ch` }}
                  >
                    {i + 1}
                  </td>
                  <td className="px-4 py-0 whitespace-pre">{line || ' '}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}

// ── CSV preview ──────────────────────────────────────────────────────────────

function CsvPreview({ content }: { content: string }) {
  const rows = parseCSV(content);
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No data found in CSV file.
      </p>
    );
  }

  const headers = rows[0];
  const body = rows.slice(1);
  const totalRows = body.length;
  const maxCols = Math.max(...rows.map((r) => r.length));

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
        <span className="text-xs text-muted-foreground">
          {totalRows.toLocaleString()} row{totalRows !== 1 ? 's' : ''} ×{' '}
          {maxCols} column{maxCols !== 1 ? 's' : ''}
        </span>
      </div>
      <ScrollArea className="max-h-[58vh]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-12 text-center text-xs font-mono">#</TableHead>
                {headers.map((h, i) => (
                  <TableHead key={i} className="text-xs font-semibold">
                    {h || `Col ${i + 1}`}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {body.map((row, ri) => (
                <TableRow key={ri}>
                  <TableCell className="text-center text-xs text-muted-foreground font-mono">
                    {ri + 1}
                  </TableCell>
                  {Array.from({ length: maxCols }).map((_, ci) => (
                    <TableCell key={ci} className="text-xs">
                      {row[ci] ?? ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}

// ── Markdown preview ─────────────────────────────────────────────────────────

function MarkdownPreview({ content }: { content: string }) {
  const html = renderMarkdownToHtml(content);

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 border-b">
        <Badge variant="secondary" className="text-[10px]">
          Markdown
        </Badge>
      </div>
      <ScrollArea className="max-h-[58vh]">
        <div
          className="prose prose-sm dark:prose-invert max-w-none p-6
            [&_.preview-code-block]:bg-muted [&_.preview-code-block]:rounded-md [&_.preview-code-block]:p-4 [&_.preview-code-block]:overflow-x-auto [&_.preview-code-block]:text-xs [&_.preview-code-block]:font-mono
            [&_.preview-inline-code]:bg-muted [&_.preview-inline-code]:px-1.5 [&_.preview-inline-code]:py-0.5 [&_.preview-inline-code]:rounded [&_.preview-inline-code]:text-xs [&_.preview-inline-code]:font-mono
            [&_.preview-link]:text-primary [&_.preview-link]:underline
            [&_.preview-blockquote]:border-l-4 [&_.preview-blockquote]:border-muted-foreground/30 [&_.preview-blockquote]:pl-4 [&_.preview-blockquote]:italic [&_.preview-blockquote]:text-muted-foreground
            [&_.preview-list]:list-disc [&_.preview-list]:pl-6 [&_ol.preview-list]:list-decimal
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4
            [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3
            [&_p]:mb-3 [&_p]:leading-relaxed
            [&_hr]:my-6 [&_hr]:border-muted-foreground/20
            [&_li]:mb-1"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </ScrollArea>
    </div>
  );
}

// ── Fallback (unknown / unsupported types) ───────────────────────────────────

function FallbackPreview({
  doc,
  onDownload,
  categoryInfo,
}: {
  doc: DocumentResponse;
  onDownload: () => void;
  categoryInfo: ReturnType<typeof getCategoryInfo> | null;
}) {
  const Icon = categoryInfo?.icon;
  return (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
      {Icon && (
        <div className={cn('rounded-2xl p-5', categoryInfo?.bgColor)}>
          <Icon className={cn('h-14 w-14', categoryInfo?.color)} />
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{doc.name}</p>
      <p className="text-xs">{doc.mimeType} · {formatFileSize(doc.fileSize)}</p>
      <p className="text-xs text-center max-w-sm">
        Preview is not available for this file type. Download to view in your local application.
      </p>
      <Button variant="outline" size="sm" className="gap-1.5 mt-2" onClick={onDownload}>
        <Download className="h-3.5 w-3.5" /> Download
      </Button>
    </div>
  );
}
