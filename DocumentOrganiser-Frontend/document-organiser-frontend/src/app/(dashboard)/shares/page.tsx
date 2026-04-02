'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Link as LinkIcon,
  Copy,
  Trash2,
  Loader2,
  ExternalLink,
  Lock,
  Unlock,
  Calendar,
  Eye,
  Download,
  Edit3,
  MoreHorizontal,
  RefreshCw,
  Clock,
  FileText,
  Folder,
} from 'lucide-react';
import { toast } from 'sonner';
import { sharesApi } from '@/lib/api/shares';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatRelativeTime, formatDate } from '@/lib/utils/format';
import type { ShareLinkResponse, SharePermission } from '@/lib/types';

const editShareLinkSchema = z.object({
  permission: z.enum(['VIEW', 'DOWNLOAD', 'EDIT']),
  password: z.string().optional(),
  removePassword: z.boolean().optional(),
  expiresAt: z.string().optional(),
  removeExpiry: z.boolean().optional(),
  maxAccessCount: z.number().min(0).optional(),
  removeMaxAccess: z.boolean().optional(),
  isActive: z.boolean(),
});

type EditShareLinkFormValues = z.infer<typeof editShareLinkSchema>;

export default function ShareLinksPage() {
  const queryClient = useQueryClient();
  const [editingLink, setEditingLink] = useState<ShareLinkResponse | null>(null);
  const [deletingLink, setDeletingLink] = useState<ShareLinkResponse | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['share-links'],
    queryFn: () => sharesApi.getShareLinks(0, 100),
  });

  const revokeMutation = useMutation({
    mutationFn: (linkId: string) => sharesApi.revokeShareLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-links'] });
      setDeletingLink(null);
      toast.success('Share link deleted');
    },
    onError: () => toast.error('Failed to delete share link'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof sharesApi.updateShareLink>[1] }) =>
      sharesApi.updateShareLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-links'] });
      setEditingLink(null);
      toast.success('Share link updated');
    },
    onError: () => toast.error('Failed to update share link'),
  });

  const form = useForm<EditShareLinkFormValues>({
    resolver: zodResolver(editShareLinkSchema),
    defaultValues: {
      permission: 'VIEW',
      password: '',
      removePassword: false,
      expiresAt: '',
      removeExpiry: false,
      maxAccessCount: 0,
      removeMaxAccess: false,
      isActive: true,
    },
  });

  const handleEdit = (link: ShareLinkResponse) => {
    setEditingLink(link);
    form.reset({
      permission: link.permission,
      password: '',
      removePassword: false,
      expiresAt: link.expiresAt ? link.expiresAt.split('T')[0] : '',
      removeExpiry: false,
      maxAccessCount: link.maxAccessCount ?? 0,
      removeMaxAccess: false,
      isActive: link.isActive,
    });
  };

  const onSubmit = (values: EditShareLinkFormValues) => {
    if (!editingLink) return;

    updateMutation.mutate({
      id: editingLink.id,
      data: {
        permission: values.permission as SharePermission,
        password: values.removePassword ? '' : (values.password || undefined),
        expiresAt: values.removeExpiry ? null : (values.expiresAt ? `${values.expiresAt}T23:59:59Z` : undefined),
        maxAccessCount: values.removeMaxAccess ? null : (values.maxAccessCount || undefined),
        isActive: values.isActive,
      },
    });
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const links = data?.content ?? [];

  const getPermissionBadge = (permission: SharePermission) => {
    const colors = {
      VIEW: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      DOWNLOAD: 'bg-green-500/10 text-green-600 border-green-500/20',
      EDIT: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    };
    const icons = {
      VIEW: <Eye className="h-3 w-3" />,
      DOWNLOAD: <Download className="h-3 w-3" />,
      EDIT: <Edit3 className="h-3 w-3" />,
    };
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${colors[permission]}`}>
        {icons[permission]}
        {permission.charAt(0) + permission.slice(1).toLowerCase()}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-destructive mb-4">Failed to load share links</p>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['share-links'] })}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Share Links</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your active share links
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : links.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No share links</h2>
              <p className="text-muted-foreground max-w-md">
                You haven&apos;t created any share links yet. Share a document or folder
                to generate a shareable link.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <Card key={link.id} className={!link.isActive ? 'opacity-60' : ''}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                    {link.itemType === 'DOCUMENT' ? (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Folder className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium truncate">{link.itemName}</h3>
                      {!link.isActive && (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {link.accessCount} views
                        {link.maxAccessCount && ` / ${link.maxAccessCount} max`}
                      </span>
                      {link.hasPassword && (
                        <span className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Protected
                        </span>
                      )}
                      {link.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires {formatRelativeTime(link.expiresAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[300px]">
                        {link.url}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(link.url)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {getPermissionBadge(link.permission)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyToClipboard(link.url)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Link
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(link)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeletingLink(link)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Share Link</DialogTitle>
            <DialogDescription>
              Update settings for {editingLink?.itemName}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        When disabled, the link won&apos;t work
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="VIEW">View only</SelectItem>
                        <SelectItem value="DOWNLOAD">View & Download</SelectItem>
                        <SelectItem value="EDIT">Full Edit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Password Protection</FormLabel>
                {editingLink?.hasPassword && (
                  <FormField
                    control={form.control}
                    name="removePassword"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0 text-sm font-normal">
                          Remove password protection
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                )}
                {(!editingLink?.hasPassword || !form.watch('removePassword')) && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={editingLink?.hasPassword ? 'Enter new password' : 'Set a password'}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {editingLink?.hasPassword
                            ? 'Leave empty to keep current password'
                            : 'Optional password to protect the link'}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="space-y-2">
                <FormLabel>Expiration</FormLabel>
                {editingLink?.expiresAt && (
                  <FormField
                    control={form.control}
                    name="removeExpiry"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0 text-sm font-normal">
                          Remove expiration date
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                )}
                {(!editingLink?.expiresAt || !form.watch('removeExpiry')) && (
                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Link will stop working after this date
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="space-y-2">
                <FormLabel>Access Limit</FormLabel>
                {editingLink?.maxAccessCount && (
                  <FormField
                    control={form.control}
                    name="removeMaxAccess"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0 text-sm font-normal">
                          Remove access limit
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                )}
                {(!editingLink?.maxAccessCount || !form.watch('removeMaxAccess')) && (
                  <FormField
                    control={form.control}
                    name="maxAccessCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="0 for unlimited"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of times the link can be accessed
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingLink(null)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingLink} onOpenChange={(open) => !open && setDeletingLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Share Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this share link for &quot;{deletingLink?.itemName}&quot;?
              Anyone with this link will no longer be able to access the {deletingLink?.itemType.toLowerCase()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingLink && revokeMutation.mutate(deletingLink.id)}
              disabled={revokeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
