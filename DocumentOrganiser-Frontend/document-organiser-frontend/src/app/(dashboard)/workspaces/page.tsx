'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Building2 } from 'lucide-react';
import { useWorkspaces } from '@/lib/hooks/useWorkspaces';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateWorkspaceDialog, WorkspaceCard, DeleteWorkspaceDialog } from '@/components/features/workspaces';
import type { WorkspaceResponse } from '@/lib/types';

export default function WorkspacesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, isLoading, error } = useWorkspaces();
  const [deletingWorkspace, setDeletingWorkspace] = useState<WorkspaceResponse | null>(null);

  const workspaces = data?.content ?? [];

  const handleWorkspaceCreated = (workspaceId: string) => {
    router.push(`/workspaces/${workspaceId}`);
  };

  const handleWorkspaceDeleted = () => {
    setDeletingWorkspace(null);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-4">Failed to load workspaces</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground mt-1">
            Collaborate with your team in shared workspaces
          </p>
        </div>
        <CreateWorkspaceDialog
          onSuccess={handleWorkspaceCreated}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Workspace
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No workspaces yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create your first workspace to start collaborating with your team on documents and folders.
          </p>
          <CreateWorkspaceDialog
            onSuccess={handleWorkspaceCreated}
            trigger={
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Workspace
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              currentUserIsOwner={workspace.ownerId === user?.id}
              onDelete={() => setDeletingWorkspace(workspace)}
            />
          ))}
        </div>
      )}

      {deletingWorkspace && (
        <DeleteWorkspaceDialog
          workspaceId={deletingWorkspace.id}
          workspaceName={deletingWorkspace.name}
          trigger={<span />}
          onSuccess={handleWorkspaceDeleted}
        />
      )}
    </div>
  );
}
