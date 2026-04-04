'use client';

import { motion, Variants } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useDocumentsSharedWithMe,
  useDocumentsSharedByMe,
  useRevokeDocumentShare,
} from '@/lib/hooks/useShares';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Folder, Trash2, Users, Share2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import type { SharedItemResponse } from '@/lib/types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

function ShareList({
  items,
  isLoading,
  showRevoke = false,
  onRevoke,
}: {
  items: SharedItemResponse[];
  isLoading: boolean;
  showRevoke?: boolean;
  onRevoke?: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-600/5"
      >
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-6 mb-4 border border-white/10">
          <Users className="h-10 w-10 text-cyan-500" />
        </div>
        <h3 className="text-lg font-medium">No shared items</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {showRevoke ? "You haven't shared anything yet" : 'Nothing has been shared with you yet'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {items.map((share, idx) => (
        <motion.div key={share.id} variants={itemVariants} custom={idx}>
          <Card className="group hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:border-white/20">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 ${
                  share.itemType === 'FOLDER'
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/20'
                    : 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20'
                }`}>
                  {share.itemType === 'FOLDER' ? (
                    <Folder className="h-6 w-6 text-amber-500" />
                  ) : (
                    <FileText className="h-6 w-6 text-cyan-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{share.itemName || 'Unnamed Document'}</p>
                  <p className="text-xs text-muted-foreground">
                    {showRevoke
                      ? `Shared with ${share.sharedWithEmail}`
                      : `Shared by ${share.sharedByName}`}
                    {' · '}
                    {formatRelativeTime(share.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{share.permission}</Badge>
                {showRevoke && onRevoke && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRevoke(share.id)}
                    className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function SharedPage() {
  const { data: withMeData, isLoading: loadingWithMe } = useDocumentsSharedWithMe();
  const { data: byMeData, isLoading: loadingByMe } = useDocumentsSharedByMe();
  const revokeShare = useRevokeDocumentShare();

  const sharedWithMe = withMeData?.content ?? [];
  const sharedByMe = byMeData?.content ?? [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-3 border border-white/10">
          <Share2 className="h-6 w-6 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Shared
          </h1>
          <p className="text-muted-foreground">Manage your shared documents</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="with-me">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="with-me">Shared with me</TabsTrigger>
            <TabsTrigger value="by-me">Shared by me</TabsTrigger>
          </TabsList>
          <TabsContent value="with-me" className="mt-6">
            <ShareList items={sharedWithMe} isLoading={loadingWithMe} />
          </TabsContent>
          <TabsContent value="by-me" className="mt-6">
            <ShareList
              items={sharedByMe}
              isLoading={loadingByMe}
              showRevoke
              onRevoke={(id) => revokeShare.mutate(id)}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
