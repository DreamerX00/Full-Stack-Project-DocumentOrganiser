'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, Image, Video, Music, FileSpreadsheet, FileCode, Archive, ArrowRight } from 'lucide-react';
import { formatFileSize, formatRelativeTime } from '@/lib/utils/format';
import type { DocumentResponse } from '@/lib/types';
import Link from 'next/link';

interface RecentFilesProps {
  documents: DocumentResponse[];
}

const getFileIcon = (mimeType: string, category: string) => {
  if (mimeType.startsWith('image/')) return { icon: Image, gradient: 'from-pink-500 to-rose-600' };
  if (mimeType.startsWith('video/')) return { icon: Video, gradient: 'from-purple-500 to-violet-600' };
  if (mimeType.startsWith('audio/')) return { icon: Music, gradient: 'from-cyan-500 to-blue-600' };
  if (category === 'SPREADSHEETS') return { icon: FileSpreadsheet, gradient: 'from-emerald-500 to-green-600' };
  if (category === 'CODE') return { icon: FileCode, gradient: 'from-amber-500 to-orange-600' };
  if (category === 'ARCHIVES') return { icon: Archive, gradient: 'from-slate-500 to-gray-600' };
  return { icon: FileText, gradient: 'from-violet-500 to-purple-600' };
};

export function RecentFiles({ documents }: RecentFilesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-white/10 bg-card/80 backdrop-blur-sm">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
        
        <CardHeader className="flex flex-row items-center justify-between pt-4">
          <CardTitle className="text-sm font-medium">Recent Files</CardTitle>
          <Link 
            href="/dashboard/documents"
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-violet-500" />
              </div>
              <p className="text-sm text-muted-foreground">No recent files</p>
              <p className="text-xs text-muted-foreground mt-1">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 5).map((doc, index) => {
                const { icon: Icon, gradient } = getFileIcon(doc.mimeType, doc.category);
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={`/documents/${doc.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg transition-transform group-hover:scale-105`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatRelativeTime(doc.updatedAt)}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
