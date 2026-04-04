'use client';

import { FileText, Upload, FolderPlus, Search, Star, Clock, Trash2, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
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
    gradient: 'from-violet-500/20 to-purple-600/20',
    iconColor: 'text-violet-500',
  },
  favorites: {
    icon: Star,
    title: 'No favorites',
    description: 'Star your important files to find them quickly here.',
    showUpload: false,
    showCreateFolder: false,
    gradient: 'from-amber-500/20 to-orange-600/20',
    iconColor: 'text-amber-500',
  },
  recent: {
    icon: Clock,
    title: 'No recent files',
    description: 'Files you open will appear here.',
    showUpload: false,
    showCreateFolder: false,
    gradient: 'from-cyan-500/20 to-blue-600/20',
    iconColor: 'text-cyan-500',
  },
  trash: {
    icon: Trash2,
    title: 'Trash is empty',
    description: 'Deleted files will appear here for 30 days.',
    showUpload: false,
    showCreateFolder: false,
    gradient: 'from-slate-500/20 to-gray-600/20',
    iconColor: 'text-slate-500',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
    showUpload: false,
    showCreateFolder: false,
    gradient: 'from-pink-500/20 to-rose-600/20',
    iconColor: 'text-pink-500',
  },
  shared: {
    icon: Share2,
    title: 'Nothing shared yet',
    description: 'Files shared with you will appear here.',
    showUpload: false,
    showCreateFolder: false,
    gradient: 'from-emerald-500/20 to-green-600/20',
    iconColor: 'text-emerald-500',
  },
};

export function EmptyState({ type = 'documents', onUpload, onCreateFolder }: EmptyStateProps) {
  const { icon: Icon, title, description, showUpload, showCreateFolder, gradient, iconColor } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`rounded-3xl bg-gradient-to-br ${gradient} p-8 mb-6 backdrop-blur-sm border border-white/10`}
      >
        <Icon className={`h-12 w-12 ${iconColor}`} />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-sm text-muted-foreground max-w-sm"
      >
        {description}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex gap-3"
      >
        {showUpload && (
          <Button 
            onClick={onUpload} 
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25"
          >
            <Upload className="h-4 w-4" /> Upload File
          </Button>
        )}
        {showCreateFolder && (
          <Button 
            variant="outline" 
            onClick={onCreateFolder} 
            className="gap-2 border-white/10 hover:bg-violet-500/10 hover:border-violet-500/30"
          >
            <FolderPlus className="h-4 w-4" /> New Folder
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
