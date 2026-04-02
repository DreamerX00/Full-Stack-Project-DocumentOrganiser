'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useWorkspace, useWorkspaceMembers, useWorkspaceMutations } from '@/lib/hooks/useWorkspaces';
import { useWorkspacePermissions } from '@/lib/hooks/usePermissions';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DeleteWorkspaceDialog } from '@/components/features/workspaces';
import type { WorkspaceRole } from '@/lib/types';

interface WorkspaceSettingsPageProps {
  params: Promise<{ id: string }>;
}

const workspaceSettingsSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

type WorkspaceSettingsFormValues = z.infer<typeof workspaceSettingsSchema>;

export default function WorkspaceSettingsPage({ params }: WorkspaceSettingsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  
  const { data: workspace, isLoading: workspaceLoading, error } = useWorkspace(id);
  const { data: membersData } = useWorkspaceMembers(id);
  const { update } = useWorkspaceMutations();

  const currentMember = membersData?.content.find((m) => m.userId === user?.id);
  const userRole = currentMember?.role as WorkspaceRole | undefined;
  const permissions = useWorkspacePermissions(userRole);

  const form = useForm<WorkspaceSettingsFormValues>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: {
      name: '',
      description: '',
    },
    values: workspace ? {
      name: workspace.name,
      description: workspace.description ?? '',
    } : undefined,
  });

  const onSubmit = async (values: WorkspaceSettingsFormValues) => {
    try {
      await update.mutateAsync({
        id,
        data: {
          name: values.name,
          description: values.description || undefined,
        },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = () => {
    router.push('/workspaces');
  };

  if (error) {
    return (
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-destructive mb-4">Failed to load workspace settings</p>
          <Button variant="outline" onClick={() => router.push('/workspaces')}>
            Back to Workspaces
          </Button>
        </div>
      </div>
    );
  }

  if (workspaceLoading) {
    return (
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">Workspace not found</p>
          <Button variant="outline" onClick={() => router.push('/workspaces')}>
            Back to Workspaces
          </Button>
        </div>
      </div>
    );
  }

  if (!permissions.canUpdateSettings) {
    return (
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">
            You don&apos;t have permission to access workspace settings
          </p>
          <Button variant="outline" asChild>
            <Link href={`/workspaces/${id}`}>Back to Workspace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/workspaces/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspace Settings</h1>
          <p className="text-sm text-muted-foreground">{workspace.name}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>
              Update your workspace name and description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the display name for your workspace.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="Describe what this workspace is for..."
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description to help members understand the workspace purpose.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={update.isPending || !form.formState.isDirty}>
                    {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {permissions.canDelete && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <div>
                  <p className="font-medium">Delete this workspace</p>
                  <p className="text-sm text-muted-foreground">
                    Once deleted, all data will be permanently removed.
                  </p>
                </div>
                <DeleteWorkspaceDialog
                  workspaceId={id}
                  workspaceName={workspace.name}
                  onSuccess={handleDelete}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
