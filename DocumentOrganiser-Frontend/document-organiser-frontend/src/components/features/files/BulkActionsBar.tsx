'use client';

import { Trash2, Download, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useFileStore } from '@/lib/store/fileStore';
import {
  useBulkDelete,
  useBulkDownload,
  useBulkFavorite,
} from '@/lib/hooks/useBulkOperations';

export function BulkActionsBar() {
  const { selectedFiles, selectedFolders, documents, clearSelection } = useFileStore();
  const bulkDelete = useBulkDelete();
  const bulkDownload = useBulkDownload();
  const bulkFavorite = useBulkFavorite();

  const count = selectedFiles.length + selectedFolders.length;

  if (count === 0) return null;

  const selectedDocs = documents
    .filter((d) => selectedFiles.includes(d.id))
    .map((d) => ({ id: d.id, name: d.originalName || d.name }));

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-2 rounded-xl border bg-background/95 px-4 py-2.5 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <span className="text-sm font-medium text-muted-foreground mr-2">
          {count} selected
        </span>

        <div className="h-5 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => bulkDownload.mutate(selectedDocs)}
          disabled={bulkDownload.isPending || selectedFiles.length === 0}
        >
          <Download className="h-4 w-4" />
          Download
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => bulkFavorite.mutate(selectedFiles)}
          disabled={bulkFavorite.isPending}
        >
          <Star className="h-4 w-4" />
          Favorite
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              disabled={bulkDelete.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {count} item(s)?</AlertDialogTitle>
              <AlertDialogDescription>
                The selected items will be moved to trash. You can restore them within 30 days.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => bulkDelete.mutate(selectedFiles)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="h-5 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={clearSelection}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>
    </div>
  );
}
