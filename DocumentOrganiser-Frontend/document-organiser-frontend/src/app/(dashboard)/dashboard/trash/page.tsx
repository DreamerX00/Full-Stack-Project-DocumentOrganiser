'use client';

import { useState } from 'react';
import {
  useTrashItems,
  useRestoreTrashItem,
  useDeleteTrashItemPermanently,
  useEmptyTrash,
} from '@/lib/hooks/useTrash';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Trash2, RotateCcw, AlertTriangle, Search, Folder } from 'lucide-react';
import { formatRelativeTime, formatFileSize, getFileIconByName } from '@/lib/utils/format';
import type { TrashItemResponse } from '@/lib/types';

export default function TrashPage() {
  const { data, isLoading } = useTrashItems();
  const restoreItem = useRestoreTrashItem();
  const deleteItem = useDeleteTrashItemPermanently();
  const emptyTrash = useEmptyTrash();
  const [searchQuery, setSearchQuery] = useState('');

  const allItems = data?.content ?? [];
  const items = searchQuery
    ? allItems.filter((item) => item.itemName.toLowerCase().includes(searchQuery.toLowerCase()))
    : allItems;

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
                  This will permanently delete all {allItems.length} items in the trash. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => emptyTrash.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Search bar */}
      {allItems.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter trash items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

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
            const FileIcon = item.itemType === 'FOLDER' ? Folder : getFileIconByName(item.itemName);
            return (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.fileSize)} · Deleted{' '}
                        {formatRelativeTime(item.deletedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreItem.mutate(item.id)}
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
                            &ldquo;{item.itemName}&rdquo; will be permanently deleted. This cannot
                            be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteItem.mutate(item.id)}
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
