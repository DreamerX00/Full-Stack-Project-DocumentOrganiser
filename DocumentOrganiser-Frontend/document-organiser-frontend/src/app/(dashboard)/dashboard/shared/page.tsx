'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSharedWithMe, useSharedByMe, useRevokeDocumentShare } from '@/lib/hooks/useShares';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Trash2, Users } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import type { SharedItemResponse } from '@/lib/types';

export default function SharedPage() {
  const { data: withMeData, isLoading: loadingWithMe } = useSharedWithMe();
  const { data: byMeData, isLoading: loadingByMe } = useSharedByMe();
  const revokeShare = useRevokeDocumentShare();

  const sharedWithMe = withMeData?.content ?? [];
  const sharedByMe = byMeData?.content ?? [];

  const ShareList = ({
    items,
    isLoading,
    showRevoke = false,
  }: {
    items: SharedItemResponse[];
    isLoading: boolean;
    showRevoke?: boolean;
  }) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No shared items</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {showRevoke ? "You haven't shared anything yet" : "Nothing has been shared with you yet"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((share) => (
          <Card key={share.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">{share.itemName || 'Unnamed Document'}</p>
                  <p className="text-xs text-muted-foreground">
                    {showRevoke ? `Shared with ${share.sharedWithUserEmail}` : `Shared by ${share.sharedByUserName}`}
                    {' · '}
                    {formatRelativeTime(share.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{share.permission}</Badge>
                {showRevoke && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => revokeShare.mutate(share.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Shared</h1>
        <p className="text-muted-foreground">Manage your shared documents</p>
      </div>

      <Tabs defaultValue="with-me">
        <TabsList>
          <TabsTrigger value="with-me">Shared with me</TabsTrigger>
          <TabsTrigger value="by-me">Shared by me</TabsTrigger>
        </TabsList>
        <TabsContent value="with-me" className="mt-4">
          <ShareList items={sharedWithMe} isLoading={loadingWithMe} />
        </TabsContent>
        <TabsContent value="by-me" className="mt-4">
          <ShareList items={sharedByMe} isLoading={loadingByMe} showRevoke />
        </TabsContent>
      </Tabs>
    </div>
  );
}
