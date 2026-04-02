'use client';

import { useState } from 'react';
import { MoreHorizontal, Shield, UserMinus, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EditMemberRoleDialog } from './EditMemberRoleDialog';
import { RemoveMemberDialog } from './RemoveMemberDialog';
import type { WorkspaceMemberResponse, WorkspaceRole } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/format';

interface MemberListProps {
  workspaceId: string;
  members: WorkspaceMemberResponse[];
  currentUserId?: string;
  canManageMembers: boolean;
  isLoading?: boolean;
}

const ROLE_COLORS: Record<WorkspaceRole, string> = {
  OWNER: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  ADMIN: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  MEMBER: 'bg-green-500/10 text-green-600 border-green-500/20',
  VIEWER: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

const ROLE_ICONS: Record<WorkspaceRole, React.ReactNode> = {
  OWNER: <Crown className="h-3 w-3" />,
  ADMIN: <Shield className="h-3 w-3" />,
  MEMBER: null,
  VIEWER: null,
};

export function MemberList({
  workspaceId,
  members,
  currentUserId,
  canManageMembers,
  isLoading,
}: MemberListProps) {
  const [editingMember, setEditingMember] = useState<WorkspaceMemberResponse | null>(null);
  const [removingMember, setRemovingMember] = useState<WorkspaceMemberResponse | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No members found
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const isOwner = member.role === 'OWNER';
          const canEditMember = canManageMembers && !isOwner && !isCurrentUser;

          return (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.profilePicture} alt={member.name} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{member.name}</span>
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {formatRelativeTime(member.joinedAt)}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`flex items-center gap-1 ${ROLE_COLORS[member.role]}`}
              >
                {ROLE_ICONS[member.role]}
                {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
              </Badge>
              {canEditMember && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingMember(member)}>
                      <Shield className="mr-2 h-4 w-4" />
                      Change Role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setRemovingMember(member)}
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>

      <EditMemberRoleDialog
        workspaceId={workspaceId}
        member={editingMember}
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
      />

      <RemoveMemberDialog
        workspaceId={workspaceId}
        member={removingMember}
        open={!!removingMember}
        onOpenChange={(open) => !open && setRemovingMember(null)}
      />
    </>
  );
}
