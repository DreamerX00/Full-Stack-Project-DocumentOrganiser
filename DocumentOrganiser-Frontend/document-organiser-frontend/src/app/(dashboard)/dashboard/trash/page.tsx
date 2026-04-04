'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-rose-500/20 to-red-600/20 p-3 border border-white/10">
            <Trash2 className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-transparent">
              Trash
            </h1>
            <p className="text-muted-foreground">
              Items in trash will be permanently deleted after 30 days
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-500/25">
                <Trash2 className="h-4 w-4" /> Empty Trash
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <div className="rounded-lg bg-gradient-to-br from-rose-500/20 to-red-600/20 p-2">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  </div>
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
                  className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </motion.div>

      {/* Search bar */}
      {allItems.length > 0 && (
        <motion.div variants={itemVariants} className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter trash items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState type="trash" />
      ) : (
        <motion.div variants={containerVariants} className="space-y-2">
          {items.map((item, idx) => {
            const FileIcon = item.itemType === 'FOLDER' ? Folder : getFileIconByName(item.itemName);
            return (
              <motion.div key={item.id} variants={itemVariants} custom={idx}>
                <Card className="group hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 hover:border-white/20">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-rose-500/10 to-red-600/10 p-2">
                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
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
                        className="gap-1 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                          >
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
                              className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500"
                            >
                              Delete Forever
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
