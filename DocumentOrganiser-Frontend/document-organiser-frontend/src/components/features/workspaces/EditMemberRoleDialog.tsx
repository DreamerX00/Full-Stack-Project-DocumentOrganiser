'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useWorkspaceMemberMutations } from '@/lib/hooks/useWorkspaces';
import type { WorkspaceRole, WorkspaceMemberResponse } from '@/lib/types';

interface EditMemberRoleDialogProps {
  workspaceId: string;
  member: WorkspaceMemberResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ROLE_DESCRIPTIONS: Record<Exclude<WorkspaceRole, 'OWNER'>, string> = {
  ADMIN: 'Can manage members and workspace settings',
  MEMBER: 'Can create and edit documents',
  VIEWER: 'Can only view documents',
};

export function EditMemberRoleDialog({
  workspaceId,
  member,
  open,
  onOpenChange,
  onSuccess,
}: EditMemberRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>(member?.role ?? 'MEMBER');
  const { updateRole } = useWorkspaceMemberMutations(workspaceId);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    if (!member || selectedRole === member.role) {
      onOpenChange(false);
      return;
    }

    try {
      await updateRole.mutateAsync({
        memberId: member.id,
        role: selectedRole,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  // Reset selected role when member changes
  if (member && selectedRole !== member.role && !updateRole.isPending) {
    setSelectedRole(member.role);
  }

  if (!member) return null;

  const isOwner = member.role === 'OWNER';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Member Role</DialogTitle>
          <DialogDescription>
            Change the role for this workspace member.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.profilePicture} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{member.name}</p>
              <p className="text-sm text-muted-foreground truncate">{member.email}</p>
            </div>
          </div>

          {isOwner ? (
            <p className="text-sm text-muted-foreground">
              The workspace owner&apos;s role cannot be changed.
            </p>
          ) : (
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as WorkspaceRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {ROLE_DESCRIPTIONS[selectedRole as Exclude<WorkspaceRole, 'OWNER'>]}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateRole.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isOwner || selectedRole === member.role || updateRole.isPending}
          >
            {updateRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
