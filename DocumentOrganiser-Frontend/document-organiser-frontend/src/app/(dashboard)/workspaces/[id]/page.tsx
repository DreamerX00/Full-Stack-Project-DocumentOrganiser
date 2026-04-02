'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  Users,
  FileText,
  Folder,
  Upload,
  FolderPlus,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';
import { useWorkspace, useWorkspaceMembers } from '@/lib/hooks/useWorkspaces';
import { useWorkspacePermissions } from '@/lib/hooks/usePermissions';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InviteMemberDialog, MemberList } from '@/components/features/workspaces';
import type { WorkspaceRole } from '@/lib/types';

interface WorkspaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkspaceDetailPage({ params }: WorkspaceDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  
  const { data: workspace, isLoading: workspaceLoading, error } = useWorkspace(id);
  const { data: membersData, isLoading: membersLoading } = useWorkspaceMembers(id);

  // Find current user's role in this workspace
  const currentMember = membersData?.content.find((m) => m.userId === user?.id);
  const userRole = currentMember?.role as WorkspaceRole | undefined;
  const permissions = useWorkspacePermissions(userRole);

  const members = membersData?.content ?? [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (error) {
    return (
      <div className="container max-w-6xl py-8">
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
      <div className="container max-w-6xl py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="container max-w-6xl py-8">
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
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/workspaces">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {getInitials(workspace.name)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{workspace.name}</h1>
              {workspace.description && (
                <p className="text-sm text-muted-foreground">{workspace.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {permissions.canManageMembers && (
            <InviteMemberDialog workspaceId={id} />
          )}
          {permissions.canUpdateSettings && (
            <Button variant="outline" asChild>
              <Link href={`/workspaces/${id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Members</CardDescription>
            <CardTitle className="text-3xl">{workspace.memberCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex -space-x-2">
              {members.slice(0, 5).map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.profilePicture} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {workspace.memberCount > 5 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground">
                    +{workspace.memberCount - 5}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documents</CardDescription>
            <CardTitle className="text-3xl">{workspace.documentCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Folders</CardDescription>
            <CardTitle className="text-3xl">{workspace.folderCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Folder className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Role</CardDescription>
            <CardTitle className="text-xl capitalize">
              {userRole?.toLowerCase() ?? 'Loading...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">
              {userRole === 'OWNER' && 'Full Access'}
              {userRole === 'ADMIN' && 'Admin Access'}
              {userRole === 'MEMBER' && 'Edit Access'}
              {userRole === 'VIEWER' && 'View Only'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Workspace Files</h2>
            {permissions.canEdit && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
                <Button size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            )}
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">No files yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload documents or create folders to get started
                </p>
                {permissions.canEdit && (
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Members ({workspace.memberCount})
            </h2>
            {permissions.canManageMembers && (
              <InviteMemberDialog
                workspaceId={id}
                trigger={
                  <Button size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Invite
                  </Button>
                }
              />
            )}
          </div>
          <Card>
            <CardContent className="pt-6">
              <MemberList
                workspaceId={id}
                members={members}
                currentUserId={user?.id}
                canManageMembers={permissions.canManageMembers}
                isLoading={membersLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
