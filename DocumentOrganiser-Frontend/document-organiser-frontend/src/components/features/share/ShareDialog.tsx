'use client';

import { useState } from 'react';
import { Copy, Link2, Mail, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SharePermission } from '@/lib/types';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils/format';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onShareWithUser?: (email: string, permission: SharePermission) => void;
  onCreateLink?: (permission: SharePermission) => void;
  shareLink?: string;
  isLoading?: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  itemName,
  onShareWithUser,
  onCreateLink,
  shareLink,
  isLoading,
}: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<SharePermission>(SharePermission.VIEW);
  const [copied, setCopied] = useState(false);

  const handleShareWithUser = () => {
    if (!email.trim()) return;
    onShareWithUser?.(email.trim(), permission);
    setEmail('');
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      const success = await copyToClipboard(shareLink);
      if (success) {
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share &quot;{itemName}&quot;</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="email">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-3.5 w-3.5" /> Share with Email
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-2">
              <Link2 className="h-3.5 w-3.5" /> Get Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label>Email address</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Permission</Label>
              <Select value={permission} onValueChange={(v) => setPermission(v as SharePermission)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SharePermission.VIEW}>Can view</SelectItem>
                  <SelectItem value={SharePermission.DOWNLOAD}>Can download</SelectItem>
                  <SelectItem value={SharePermission.EDIT}>Can edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleShareWithUser}
              disabled={!email.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Sharing...' : 'Share'}
            </Button>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>Permission</Label>
              <Select value={permission} onValueChange={(v) => setPermission(v as SharePermission)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SharePermission.VIEW}>Can view</SelectItem>
                  <SelectItem value={SharePermission.DOWNLOAD}>Can download</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shareLink ? (
              <div className="flex gap-2">
                <Input value={shareLink} readOnly className="text-xs" />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => onCreateLink?.(permission)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Generating...' : 'Generate Link'}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
