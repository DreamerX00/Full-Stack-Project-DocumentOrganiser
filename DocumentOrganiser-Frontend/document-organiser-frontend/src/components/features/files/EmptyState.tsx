'use client';

import { FileText, Upload, FolderPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type?: 'documents' | 'favorites' | 'recent' | 'trash' | 'search' | 'shared';
  onUpload?: () => void;
  onCreateFolder?: () => void;
}

const config = {
  documents: {
    icon: FileText,
    title: 'No documents yet',
    description: 'Upload your first document to get started.',
    showUpload: true,
    showCreateFolder: true,
  },
  favorites: {
    icon: FileText,
    title: 'No favorites',
    description: 'Star your important files to find them quickly here.',
    showUpload: false,
    showCreateFolder: false,
  },
  recent: {
    icon: FileText,
    title: 'No recent files',
    description: 'Files you open will appear here.',
    showUpload: false,
    showCreateFolder: false,
  },
  trash: {
    icon: FileText,
    title: 'Trash is empty',
    description: 'Deleted files will appear here for 30 days.',
    showUpload: false,
    showCreateFolder: false,
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
    showUpload: false,
    showCreateFolder: false,
  },
  shared: {
    icon: FileText,
    title: 'Nothing shared yet',
    description: 'Files shared with you will appear here.',
    showUpload: false,
    showCreateFolder: false,
  },
};

export function EmptyState({ type = 'documents', onUpload, onCreateFolder }: EmptyStateProps) {
  const { icon: Icon, title, description, showUpload, showCreateFolder } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      <div className="mt-6 flex gap-3">
        {showUpload && (
          <Button onClick={onUpload} className="gap-2">
            <Upload className="h-4 w-4" /> Upload File
          </Button>
        )}
        {showCreateFolder && (
          <Button variant="outline" onClick={onCreateFolder} className="gap-2">
            <FolderPlus className="h-4 w-4" /> New Folder
          </Button>
        )}
      </div>
    </div>
  );
}
