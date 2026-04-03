'use client';

import { use, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  Users,
  Upload,
  FolderPlus,
  FileText,
  Folder,
  File,
  MoreVertical,
  Download,
  Trash2,
} from 'lucide-react';
import { useWorkspace, useWorkspaceMembers } from '@/lib/hooks/useWorkspaces';
import { useWorkspacePermissions } from '@/lib/hooks/usePermissions';
import { useAuthStore } from '@/lib/store/authStore';
import { useCreateFolder, useWorkspaceRootFolders } from '@/lib/hooks/useFolders';
import { useWorkspaceDocuments, useUploadWorkspaceDocument, useDownloadDocument, useDeleteDocument } from '@/lib/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InviteMemberDialog, MemberList } from '@/components/features/workspaces';
import { CreateFolderDialog } from '@/components/features/folders/CreateFolderDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { formatFileSize, formatDate } from '@/lib/utils/format';
import type { WorkspaceRole, DocumentResponse } from '@/lib/types';

interface WorkspaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkspaceDetailPage({ params }: WorkspaceDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Dialog states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  
  const { data: workspace, isLoading: workspaceLoading, error } = useWorkspace(id);
  const { data: membersData, isLoading: membersLoading } = useWorkspaceMembers(id);
  const { data: folders, isLoading: foldersLoading } = useWorkspaceRootFolders(id);
  const { data: documentsData, isLoading: documentsLoading } = useWorkspaceDocuments(id, undefined);
  
  // Mutations
  const createFolder = useCreateFolder();
  const uploadDocument = useUploadWorkspaceDocument();
  const downloadDocument = useDownloadDocument();
  const deleteDocument = useDeleteDocument();

  // Find current user's role in this workspace
  const currentMember = membersData?.content.find((m) => m.userId === user?.id);
  const userRole = currentMember?.role as WorkspaceRole | undefined;
  const permissions = useWorkspacePermissions(userRole);

  const members = membersData?.content ?? [];
  const documents = documentsData?.content ?? [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const handleCreateFolder = (data: { name: string; description?: string; color?: string }) => {
    createFolder.mutate(
      { name: data.name, description: data.description, color: data.color, workspaceId: id },
      {
        onSuccess: () => {
          setCreateFolderOpen(false);
        },
      }
    );
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(Array.from(files));
    
    for (const file of Array.from(files)) {
      await uploadDocument.mutateAsync({
        workspaceId: id,
        file,
        onProgress: setUploadProgress,
      });
    }
    
    setUploadingFiles([]);
    setUploadProgress(0);
    setUploadOpen(false);
  }, [id, uploadDocument]);

  const handleDownload = (doc: DocumentResponse) => {
    downloadDocument.mutate(doc);
  };

  const handleDelete = (docId: string) => {
    deleteDocument.mutate(docId);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📗';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📙';
    return '📄';
  };

  if (error) {
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
          <div className="grid gap-4 md:grid-cols-2">
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

  const hasFiles = (folders && folders.length > 0) || documents.length > 0;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
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
      <div className="grid gap-4 md:grid-cols-3 mb-8">
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
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Files & Folders</CardDescription>
            <CardTitle className="text-3xl">
              {(folders?.length ?? 0) + documents.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {folders?.length ?? 0} folders, {documents.length} files
            </p>
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
                <Button variant="outline" size="sm" onClick={() => setCreateFolderOpen(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
                <Button size="sm" onClick={() => setUploadOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            )}
          </div>

          {(foldersLoading || documentsLoading) ? (
            <Card>
              <CardContent className="py-8">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : !hasFiles ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-1">No files yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload documents or create folders to get started
                  </p>
                  {permissions.canEdit && (
                    <Button onClick={() => setUploadOpen(true)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-4">
                <div className="space-y-2">
                  {/* Folders */}
                  {folders?.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: folder.color || '#6366f1' + '20' }}
                        >
                          <Folder className="h-5 w-5" style={{ color: folder.color || '#6366f1' }} />
                        </div>
                        <div>
                          <p className="font-medium">{folder.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {folder.documentCount} files, {folder.subFolderCount} folders
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Folder</Badge>
                    </div>
                  ))}

                  {/* Documents */}
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                          {getFileIcon(doc.mimeType)}
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(doc.fileSize)} • {formatDate(doc.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{doc.category}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            {permissions.canEdit && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(doc.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
      
      {/* Dialogs */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onSubmit={handleCreateFolder}
        isLoading={createFolder.isPending}
      />

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload files to this workspace. All members will be able to access them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {uploadingFiles.length > 0 ? (
              <div className="space-y-3">
                {uploadingFiles.map((file, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{file.name}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Input
                  type="file"
                  multiple
                  className="hidden"
                  id="workspace-file-upload"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="workspace-file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="font-medium">Click to select files</p>
                  <p className="text-sm text-muted-foreground">or drag and drop</p>
                </label>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
