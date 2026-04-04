'use client';

import { use, useState, useCallback, useMemo } from 'react';
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
  MoreVertical,
  Download,
  Trash2,
  ChevronRight,
  Home,
  Search,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Eye,
  FolderOpen,
  RefreshCw,
  Copy,
  Pencil,
  Share2,
} from 'lucide-react';
import { useWorkspace, useWorkspaceMembers } from '@/lib/hooks/useWorkspaces';
import { useWorkspacePermissions } from '@/lib/hooks/usePermissions';
import { useAuthStore } from '@/lib/store/authStore';
import { useCreateFolder, useWorkspaceRootFolders, useWorkspaceSubfolders, useDeleteFolder } from '@/lib/hooks/useFolders';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatFileSize, formatDate } from '@/lib/utils/format';
import type { WorkspaceRole, DocumentResponse, FolderResponse } from '@/lib/types';

interface WorkspaceDetailPageProps {
  params: Promise<{ id: string }>;
}

// Breadcrumb item type
interface BreadcrumbItem {
  id: string | null;
  name: string;
}

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'date' | 'size';
type SortOrder = 'asc' | 'desc';

export default function WorkspaceDetailPage({ params }: WorkspaceDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: 'Root' }]);
  
  // View and sort state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'folder' | 'document'; id: string; name: string } | null>(null);
  
  const { data: workspace, isLoading: workspaceLoading, error, refetch: refetchWorkspace } = useWorkspace(id);
  const { data: membersData, isLoading: membersLoading } = useWorkspaceMembers(id);
  
  // Conditional folder fetching based on current location
  const { data: rootFolders, isLoading: rootFoldersLoading, refetch: refetchRootFolders } = useWorkspaceRootFolders(id);
  const { data: subFolders, isLoading: subFoldersLoading, refetch: refetchSubFolders } = useWorkspaceSubfolders(
    id,
    currentFolderId || ''
  );
  
  // Get documents for current folder
  const { data: documentsData, isLoading: documentsLoading, refetch: refetchDocuments } = useWorkspaceDocuments(
    id,
    currentFolderId || undefined
  );
  
  // Mutations
  const createFolder = useCreateFolder();
  const uploadDocument = useUploadWorkspaceDocument();
  const downloadDocument = useDownloadDocument();
  const deleteDocument = useDeleteDocument();
  const deleteFolder = useDeleteFolder();

  // Find current user's role in this workspace
  const currentMember = membersData?.content.find((m) => m.userId === user?.id);
  const userRole = currentMember?.role as WorkspaceRole | undefined;
  const permissions = useWorkspacePermissions(userRole);

  const members = membersData?.content ?? [];
  const documents = documentsData?.content ?? [];
  
  // Get the correct folders based on current location
  const folders = currentFolderId ? (subFolders || []) : (rootFolders || []);
  const foldersLoading = currentFolderId ? subFoldersLoading : rootFoldersLoading;
  
  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filteredFolders = folders.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    let filteredDocs = documents.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort folders
    filteredFolders = [...filteredFolders].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // Sort documents
    filteredDocs = [...filteredDocs].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return { folders: filteredFolders, documents: filteredDocs };
  }, [folders, documents, searchQuery, sortField, sortOrder]);

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
      { 
        name: data.name, 
        description: data.description, 
        color: data.color, 
        workspaceId: id,
        parentFolderId: currentFolderId || undefined,
      },
      {
        onSuccess: () => {
          setCreateFolderOpen(false);
          if (currentFolderId) {
            refetchSubFolders();
          } else {
            refetchRootFolders();
          }
        },
      }
    );
  };
  
  const handleOpenFolder = (folder: FolderResponse) => {
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
  };
  
  const handleNavigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(Array.from(files));
    
    for (const file of Array.from(files)) {
      await uploadDocument.mutateAsync({
        workspaceId: id,
        folderId: currentFolderId || undefined,
        file,
        onProgress: setUploadProgress,
      });
    }
    
    setUploadingFiles([]);
    setUploadProgress(0);
    setUploadOpen(false);
    refetchDocuments();
  }, [id, currentFolderId, uploadDocument, refetchDocuments]);

  const handleDownload = (doc: DocumentResponse) => {
    downloadDocument.mutate(doc);
  };

  const confirmDelete = (type: 'folder' | 'document', id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'document') {
      deleteDocument.mutate(itemToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
          refetchDocuments();
        },
      });
    } else {
      deleteFolder.mutate(itemToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
          if (currentFolderId) {
            refetchSubFolders();
          } else {
            refetchRootFolders();
          }
        },
      });
    }
  };
  
  const handleRefresh = () => {
    refetchWorkspace();
    refetchDocuments();
    if (currentFolderId) {
      refetchSubFolders();
    } else {
      refetchRootFolders();
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📗';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📙';
    if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return '📦';
    if (mimeType.includes('text') || mimeType.includes('code')) return '📝';
    return '📄';
  };
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
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
          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Files</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] sm:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search files..."
                  className="pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    <span className="hidden sm:inline">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortField('name')}>
                    Name {sortField === 'name' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortField('date')}>
                    Date {sortField === 'date' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortField('size')}>
                    Size {sortField === 'size' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleSortOrder}>
                    {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* View mode */}
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Actions */}
              {permissions.canEdit && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setCreateFolderOpen(true)}>
                    <FolderPlus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">New Folder</span>
                  </Button>
                  <Button size="sm" onClick={() => setUploadOpen(true)}>
                    <Upload className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Upload</span>
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto py-2">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1 shrink-0">
                {index > 0 && <ChevronRight className="h-4 w-4" />}
                <button
                  onClick={() => handleNavigateToBreadcrumb(index)}
                  className={`flex items-center gap-1 hover:text-foreground transition-colors ${
                    index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''
                  }`}
                >
                  {index === 0 ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    <FolderOpen className="h-4 w-4" />
                  )}
                  <span>{crumb.name}</span>
                </button>
              </div>
            ))}
          </nav>

          {(foldersLoading || documentsLoading) ? (
            <Card>
              <CardContent className="py-8">
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-3'}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className={viewMode === 'grid' ? 'h-32 w-full' : 'h-16 w-full'} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : filteredAndSortedItems.folders.length === 0 && filteredAndSortedItems.documents.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  {searchQuery ? (
                    <>
                      <Search className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-1">No results found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        No files or folders match "{searchQuery}"
                      </p>
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear search
                      </Button>
                    </>
                  ) : currentFolderId ? (
                    <>
                      <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-1">This folder is empty</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload files or create subfolders
                      </p>
                      {permissions.canEdit && (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setCreateFolderOpen(true)}>
                            <FolderPlus className="mr-2 h-4 w-4" />
                            New Folder
                          </Button>
                          <Button onClick={() => setUploadOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Files
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Folders */}
              {filteredAndSortedItems.folders.map((folder) => (
                <Card
                  key={folder.id}
                  className="group cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleOpenFolder(folder)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className="h-16 w-16 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:shadow-lg group-hover:brightness-110"
                        style={{ backgroundColor: (folder.color || '#6366f1') + '20' }}
                      >
                        <Folder className="h-8 w-8" style={{ color: folder.color || '#6366f1' }} />
                      </div>
                      <p className="font-medium text-sm truncate w-full">{folder.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {folder.documentCount} files
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Documents */}
              {filteredAndSortedItems.documents.map((doc) => (
                <Card
                  key={doc.id}
                  className="group cursor-pointer hover:shadow-md transition-all relative"
                >
                  <CardContent className="p-4">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/documents/${doc.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(doc)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          {permissions.canEdit && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => confirmDelete('document', doc.id, doc.name)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mb-3 text-2xl">
                        {getFileIcon(doc.mimeType)}
                      </div>
                      <p className="font-medium text-sm truncate w-full">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(doc.fileSize)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* List View */
            <Card>
              <CardContent className="py-2">
                <div className="divide-y">
                  {/* Folders */}
                  {filteredAndSortedItems.folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                      onClick={() => handleOpenFolder(folder)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: (folder.color || '#6366f1') + '20' }}
                        >
                          <Folder className="h-5 w-5" style={{ color: folder.color || '#6366f1' }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{folder.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {folder.documentCount} files, {folder.subFolderCount} folders
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {formatDate(folder.updatedAt)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenFolder(folder); }}>
                              <FolderOpen className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                            {permissions.canEdit && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => { e.stopPropagation(); confirmDelete('folder', folder.id, folder.name); }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                  {/* Documents */}
                  {filteredAndSortedItems.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
                          {getFileIcon(doc.mimeType)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(doc.fileSize)} • {formatDate(doc.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="hidden sm:inline-flex">{doc.category}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/documents/${doc.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            {permissions.canEdit && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => confirmDelete('document', doc.id, doc.name)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
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
              {currentFolderId 
                ? `Upload files to "${breadcrumbs[breadcrumbs.length - 1]?.name}". All workspace members will be able to access them.`
                : "Upload files to workspace root. All members will be able to access them."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentFolderId && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span>Uploading to: <strong>{breadcrumbs[breadcrumbs.length - 1]?.name}</strong></span>
              </div>
            )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.type === 'folder' ? 'Folder' : 'File'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{itemToDelete?.name}"</strong>?
              {itemToDelete?.type === 'folder' && ' This will also delete all files and subfolders inside it.'}
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
