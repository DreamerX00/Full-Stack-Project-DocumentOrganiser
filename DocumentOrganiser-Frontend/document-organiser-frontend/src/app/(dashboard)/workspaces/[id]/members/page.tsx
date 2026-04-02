'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import { useWorkspace, useWorkspaceMembers } from '@/lib/hooks/useWorkspaces';
import { useWorkspacePermissions } from '@/lib/hooks/usePermissions';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InviteMemberDialog, MemberList } from '@/components/features/workspaces';
import type { WorkspaceRole } from '@/lib/types';

interface WorkspaceMembersPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkspaceMembersPage({ params }: WorkspaceMembersPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: workspace, isLoading: workspaceLoading, error: workspaceError } = useWorkspace(id);
  const { data: membersData, isLoading: membersLoading } = useWorkspaceMembers(id);

  const currentMember = membersData?.content.find((m) => m.userId === user?.id);
  const userRole = currentMember?.role as WorkspaceRole | undefined;
  const permissions = useWorkspacePermissions(userRole);

  const members = membersData?.content ?? [];

  if (workspaceError) {
    return (
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-destructive mb-4">Failed to load workspace</p>
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
          <Skeleton className="h-96 rounded-lg" />
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

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/workspaces/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Members</h1>
            <p className="text-sm text-muted-foreground">{workspace.name}</p>
          </div>
        </div>
        {permissions.canManageMembers && (
          <InviteMemberDialog workspaceId={id} />
        )}
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Workspace Members
          </CardTitle>
          <CardDescription>
            {workspace.memberCount} {workspace.memberCount === 1 ? 'member' : 'members'} in this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MemberList
            workspaceId={id}
            members={members}
            currentUserId={user?.id}
            canManageMembers={permissions.canManageMembers}
            isLoading={membersLoading}
          />
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding what each role can do in a workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium text-amber-600 mb-2">Owner</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Full control over the workspace</li>
                  <li>• Can delete the workspace</li>
                  <li>• Can transfer ownership</li>
                  <li>• All Admin permissions</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium text-blue-600 mb-2">Admin</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Can invite and remove members</li>
                  <li>• Can change member roles</li>
                  <li>• Can update workspace settings</li>
                  <li>• All Member permissions</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium text-green-600 mb-2">Member</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Can create and edit documents</li>
                  <li>• Can create and manage folders</li>
                  <li>• Can share documents</li>
                  <li>• All Viewer permissions</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium text-gray-600 mb-2">Viewer</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Can view all documents</li>
                  <li>• Can download files</li>
                  <li>• Can add comments</li>
                  <li>• Cannot edit or create content</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
