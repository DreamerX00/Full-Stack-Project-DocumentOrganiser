'use client';

import { useState, useEffect } from 'react';
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
import {
  Download,
  X,
  FileText,
  Share2,
  Star,
  Info,
  ExternalLink,
} from 'lucide-react';
import { formatFileSize, formatDate, getCategoryInfo } from '@/lib/utils/format';
import { documentsApi } from '@/lib/api/documents';
import type { DocumentResponse } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  document: DocumentResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (doc: DocumentResponse) => void;
  onShare?: (doc: DocumentResponse) => void;
  onToggleFavorite?: (doc: DocumentResponse) => void;
}

export function FilePreview({
  document: doc,
  open,
  onOpenChange,
  onDownload,
  onShare,
  onToggleFavorite,
}: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (doc && open) {
      setPreviewUrl(null);
      documentsApi
        .getPreviewUrl(doc.id)
        .then((url) => setPreviewUrl(url))
        .catch(() => setPreviewUrl(null));
    }
  }, [doc, open]);

  if (!doc) return null;

  const categoryInfo = getCategoryInfo(doc.category);
  const CategoryIcon = categoryInfo.icon;
  const isImage = doc.contentType.startsWith('image/');
  const isPdf = doc.contentType === 'application/pdf';
  const isVideo = doc.contentType.startsWith('video/');
  const isAudio = doc.contentType.startsWith('audio/');
  const isText =
    doc.contentType.startsWith('text/') ||
    doc.contentType.includes('json') ||
    doc.contentType.includes('xml') ||
    doc.contentType.includes('javascript') ||
    doc.contentType.includes('typescript');

  const renderPreview = () => {
    if (!previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <CategoryIcon className={cn('h-16 w-16 mb-4', categoryInfo.color)} />
          <p className="text-sm">Preview not available</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => onDownload?.(doc)}
          >
            <Download className="h-4 w-4" /> Download to view
          </Button>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex items-center justify-center max-h-[60vh] overflow-hidden rounded-lg bg-muted/30">
          <img
            src={previewUrl}
            alt={doc.name}
            className="max-h-[60vh] max-w-full object-contain"
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-[60vh] rounded-lg border"
          title={doc.name}
        />
      );
    }

    if (isVideo) {
      return (
        <video
          src={previewUrl}
          controls
          className="w-full max-h-[60vh] rounded-lg"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isAudio) {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <CategoryIcon className={cn('h-16 w-16', categoryInfo.color)} />
          <audio src={previewUrl} controls className="w-full max-w-md">
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // Fallback: show download
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <CategoryIcon className={cn('h-16 w-16 mb-4', categoryInfo.color)} />
        <p className="text-sm">{doc.name}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2"
          onClick={() => onDownload?.(doc)}
        >
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 truncate pr-4">
              <CategoryIcon className={cn('h-5 w-5 shrink-0', categoryInfo.color)} />
              <span className="truncate">{doc.name}</span>
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Actions bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onDownload?.(doc)}
          >
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onShare?.(doc)}
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => onToggleFavorite?.(doc)}
          >
            <Star
              className={cn(
                'h-3.5 w-3.5',
                doc.favorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              )}
            />
            {doc.favorite ? 'Unfavorite' : 'Favorite'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 ml-auto"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Info className="h-3.5 w-3.5" />
            Details
          </Button>
        </div>

        <Separator />

        <div className="flex flex-1 overflow-hidden gap-4">
          {/* Preview area */}
          <ScrollArea className="flex-1">
            <div className="p-2">{renderPreview()}</div>
          </ScrollArea>

          {/* Details sidebar */}
          {showDetails && (
            <div className="w-64 border-l pl-4 space-y-4 overflow-y-auto">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Type
                </p>
                <p className="text-sm">{categoryInfo.label}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Size
                </p>
                <p className="text-sm">{formatFileSize(doc.size)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Content Type
                </p>
                <p className="text-sm break-all">{doc.contentType}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Created
                </p>
                <p className="text-sm">{formatDate(doc.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Modified
                </p>
                <p className="text-sm">{formatDate(doc.updatedAt)}</p>
              </div>
              {doc.folderName && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Folder
                  </p>
                  <p className="text-sm">{doc.folderName}</p>
                </div>
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
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Version
                </p>
                <p className="text-sm">v{doc.currentVersion}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
