'use client';

import { useEffect, useState } from 'react';
import { trashApi } from '@/lib/api/trash';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/features/files/EmptyState';
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
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { formatRelativeTime, formatFileSize, getFileIcon } from '@/lib/utils/format';
import { toast } from 'sonner';
import type { TrashItemResponse } from '@/lib/types';

export default function TrashPage() {
  const [items, setItems] = useState<TrashItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrash = async () => {
    setIsLoading(true);
    try {
      const data = await trashApi.list();
      setItems(data.content);
    } catch {
      toast.error('Failed to load trash');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await trashApi.restore(id);
      toast.success('Item restored');
      fetchTrash();
    } catch {
      toast.error('Failed to restore');
    }
  };

  const handleDeletePermanently = async (id: string) => {
    try {
      await trashApi.deletePermanently(id);
      toast.success('Permanently deleted');
      fetchTrash();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await trashApi.emptyTrash();
      toast.success('Trash emptied');
      setItems([]);
    } catch {
      toast.error('Failed to empty trash');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trash</h1>
          <p className="text-muted-foreground">
            Items in trash will be permanently deleted after 30 days
          </p>
        </div>
        {items.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" /> Empty Trash
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Empty Trash
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {items.length} items in the trash. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleEmptyTrash} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState type="trash" />
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const FileIcon = getFileIcon(item.itemName);
            return (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.size)} · Deleted{' '}
                        {formatRelativeTime(item.deletedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(item.id)}
                      className="gap-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Restore
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive gap-1">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                          <AlertDialogDescription>
                            &ldquo;{item.itemName}&rdquo; will be permanently deleted. This cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePermanently(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Forever
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
