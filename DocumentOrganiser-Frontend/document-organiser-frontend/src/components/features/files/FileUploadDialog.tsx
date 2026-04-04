'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, CheckCircle, AlertCircle, Loader2, CloudUpload, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { useFileStore } from '@/lib/store/fileStore';
import { FileConflictDialog } from './FileConflictDialog';
import { formatFileSize } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileUploadDialog({ open, onOpenChange }: FileUploadDialogProps) {
  const {
    uploadFiles,
    queue,
    isUploading,
    clearCompleted,
    removeFromQueue,
    conflictFile,
    resolveConflict,
  } = useFileUpload();
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 p-3 border border-white/10">
                <CloudUpload className="h-5 w-5 text-violet-500" />
              </div>
              <DialogTitle className="text-lg">Upload Files</DialogTitle>
            </div>
          </DialogHeader>

          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-300 cursor-pointer',
              isDragActive
                ? 'border-violet-500 bg-gradient-to-br from-violet-500/10 to-purple-600/10 scale-[1.02]'
                : 'border-white/20 hover:border-violet-500/50 hover:bg-gradient-to-br hover:from-violet-500/5 hover:to-purple-600/5'
            )}
          >
            <input {...getInputProps()} />
            <div className={cn(
              'rounded-2xl p-4 mb-4 transition-all duration-300',
              isDragActive
                ? 'bg-gradient-to-br from-violet-500/30 to-purple-600/30'
                : 'bg-gradient-to-br from-violet-500/10 to-purple-600/10'
            )}>
              <Upload className={cn(
                'h-8 w-8 transition-all duration-300',
                isDragActive ? 'text-violet-400 scale-110' : 'text-violet-500'
              )} />
            </div>
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to browse'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Maximum file size: 100MB</p>
          </div>

          {/* Upload Queue */}
          {queue.length > 0 && (
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  {queue.length} file{queue.length > 1 ? 's' : ''}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompleted}
                  disabled={isUploading}
                  className="text-xs hover:bg-violet-500/10 hover:text-violet-500"
                >
                  Clear completed
                </Button>
              </div>

              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 transition-all duration-300',
                        item.status === 'completed' && 'border-emerald-500/30 bg-emerald-500/5',
                        item.status === 'error' && 'border-rose-500/30 bg-rose-500/5',
                        item.status === 'uploading' && 'border-violet-500/30 bg-violet-500/5',
                        item.status === 'pending' && 'border-white/10 hover:border-white/20'
                      )}
                    >
                      <div className={cn(
                        'rounded-lg p-1.5',
                        item.status === 'completed' && 'bg-emerald-500/20',
                        item.status === 'error' && 'bg-rose-500/20',
                        item.status === 'uploading' && 'bg-violet-500/20',
                        item.status === 'pending' && 'bg-white/10'
                      )}>
                        <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm">{item.file.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(item.file.size)}
                          </p>
                          {item.status === 'uploading' && (
                            <Progress value={item.progress} className="h-1.5 flex-1" />
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {item.status === 'completed' && (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        )}
                        {item.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-rose-500" />
                        )}
                        {item.status === 'uploading' && (
                          <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                        )}
                        {item.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-rose-500/10 hover:text-rose-500"
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

      {/* File conflict resolution dialog */}
      <FileConflictDialog
        open={!!conflictFile}
        fileName={conflictFile || ''}
        onResolve={resolveConflict}
      />
    </>
  );
}
