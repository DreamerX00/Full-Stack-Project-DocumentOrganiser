'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Copy, RefreshCw, SkipForward } from 'lucide-react';

export type ConflictResolution = 'replace' | 'keep-both' | 'skip';

interface FileConflictDialogProps {
  open: boolean;
  fileName: string;
  onResolve: (resolution: ConflictResolution) => void;
}

export function FileConflictDialog({ open, fileName, onResolve }: FileConflictDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            File Already Exists
          </AlertDialogTitle>
          <AlertDialogDescription>
            A file named <strong className="text-foreground">{fileName}</strong> already exists in
            this location. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onResolve('skip')} className="gap-2">
            <SkipForward className="h-4 w-4" />
            Skip
          </Button>
          <Button variant="outline" onClick={() => onResolve('keep-both')} className="gap-2">
            <Copy className="h-4 w-4" />
            Keep Both
          </Button>
          <Button variant="default" onClick={() => onResolve('replace')} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Replace
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
