'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspaceMutations } from '@/lib/hooks/useWorkspaces';

interface DeleteWorkspaceDialogProps {
  workspaceId: string;
  workspaceName: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DeleteWorkspaceDialog({
  workspaceId,
  workspaceName,
  trigger,
  onSuccess,
}: DeleteWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { delete: deleteMutation } = useWorkspaceMutations();

  const canDelete = confirmText === workspaceName;

  const handleDelete = async () => {
    if (!canDelete) return;
    
    try {
      await deleteMutation.mutateAsync(workspaceId);
      setOpen(false);
      setConfirmText('');
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="destructive">Delete Workspace</Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Workspace
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              This action cannot be undone. This will permanently delete the workspace
              <strong className="text-foreground"> {workspaceName}</strong> and remove
              all associated data including:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>All documents in this workspace</li>
              <li>All folders and their contents</li>
              <li>All member associations</li>
              <li>All sharing settings</li>
            </ul>
            <p className="pt-2">
              To confirm, type <strong className="text-foreground">{workspaceName}</strong> below:
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={workspaceName}
          className="mt-2"
        />
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setConfirmText('')}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!canDelete || deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Workspace
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
