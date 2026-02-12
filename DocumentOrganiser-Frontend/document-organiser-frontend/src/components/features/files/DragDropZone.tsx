'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragDropZoneProps {
  onFilesDropped: (files: File[]) => void;
  children: React.ReactNode;
}

export function DragDropZone({ onFilesDropped, children }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only show upload overlay for external file drags, not internal document moves
    if (e.dataTransfer?.types.includes('application/document-id')) return;
    setDragCounter((prev) => {
      if (prev === 0) setIsDragging(true);
      return prev + 1;
    });
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const next = prev - 1;
      if (next === 0) setIsDragging(false);
      return next;
    });
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragCounter(0);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        onFilesDropped(files);
        e.dataTransfer.clearData();
      }
    },
    [onFilesDropped],
  );

  useEffect(() => {
    const el = document;
    el.addEventListener('dragenter', handleDragEnter);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('drop', handleDrop);
    return () => {
      el.removeEventListener('dragenter', handleDragEnter);
      el.removeEventListener('dragleave', handleDragLeave);
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  return (
    <div className="relative">
      {children}

      {/* Full-screen overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-primary bg-primary/5 p-12">
            <Upload className="h-16 w-16 text-primary animate-bounce" />
            <p className="text-xl font-semibold text-primary">
              Drop files to upload
            </p>
            <p className="text-sm text-muted-foreground">
              Release to upload files to your documents
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
