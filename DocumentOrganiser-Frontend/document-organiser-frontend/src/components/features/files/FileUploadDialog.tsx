'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { useFileStore } from '@/lib/store/fileStore';
import { formatFileSize } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileUploadDialog({ open, onOpenChange }: FileUploadDialogProps) {
  const { uploadFiles, queue, isUploading, clearCompleted, removeFromQueue } =
    useFileUpload();
  const currentFolderId = useFileStore((s) => s.currentFolderId);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      uploadFiles(acceptedFiles, currentFolderId || undefined);
    },
    [uploadFiles, currentFolderId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragActive
              ? 'Drop files here...'
              : 'Drag & drop files here, or click to browse'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Maximum file size: 100MB
          </p>
        </div>

        {/* Upload Queue */}
        {queue.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {queue.length} file{queue.length > 1 ? 's' : ''}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
                disabled={isUploading}
              >
                Clear completed
              </Button>
            </div>

            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border p-2"
                  >
                    <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm">{item.file.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(item.file.size)}
                        </p>
                        {item.status === 'uploading' && (
                          <Progress value={item.progress} className="h-1 flex-1" />
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {item.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {item.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      {item.status === 'uploading' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {item.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFromQueue(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
