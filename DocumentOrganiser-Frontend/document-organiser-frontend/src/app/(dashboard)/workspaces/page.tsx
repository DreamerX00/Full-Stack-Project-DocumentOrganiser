'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Building2, Sparkles } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useWorkspaces } from '@/lib/hooks/useWorkspaces';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateWorkspaceDialog, WorkspaceCard, DeleteWorkspaceDialog } from '@/components/features/workspaces';
import type { WorkspaceResponse } from '@/lib/types';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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
        <div className="rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-600/20 p-6 mb-4">
          <Building2 className="h-10 w-10 text-rose-500" />
        </div>
        <p className="text-rose-500 mb-4">Failed to load workspaces</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-4 sm:p-6 lg:p-8"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Workspaces
          </h1>
          <p className="text-muted-foreground mt-1">
            Collaborate with your team in shared workspaces
          </p>
        </div>
        <CreateWorkspaceDialog
          onSuccess={handleWorkspaceCreated}
          trigger={
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25">
              <Plus className="h-4 w-4" />
              New Workspace
            </Button>
          }
        />
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
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
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/5 to-purple-600/5 backdrop-blur-sm"
        >
          <div className="rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 p-8 mb-6 border border-white/10">
            <Building2 className="h-12 w-12 text-violet-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No workspaces yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create your first workspace to start collaborating with your team on documents and folders.
          </p>
          <CreateWorkspaceDialog
            onSuccess={handleWorkspaceCreated}
            trigger={
              <Button size="lg" className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25">
                <Sparkles className="h-5 w-5" />
                Create Your First Workspace
              </Button>
            }
          />
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace, idx) => (
            <motion.div
              key={workspace.id}
              variants={itemVariants}
              custom={idx}
            >
              <WorkspaceCard
                workspace={workspace}
                currentUserIsOwner={workspace.ownerId === user?.id}
                onDelete={() => setDeletingWorkspace(workspace)}
              />
            </motion.div>
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
    </motion.div>
  );
}
