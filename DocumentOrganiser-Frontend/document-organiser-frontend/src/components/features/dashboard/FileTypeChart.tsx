'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, FileText, Image, Video, Music, FileSpreadsheet, FileCode, Archive, Presentation } from 'lucide-react';

interface FileTypeChartProps {
  data: Record<string, number>;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof FileText; gradient: string; color: string }> = {
  DOCUMENTS: { icon: FileText, gradient: 'from-violet-500 to-purple-600', color: '#8b5cf6' },
  IMAGES: { icon: Image, gradient: 'from-pink-500 to-rose-600', color: '#ec4899' },
  VIDEOS: { icon: Video, gradient: 'from-red-500 to-orange-600', color: '#ef4444' },
  AUDIO: { icon: Music, gradient: 'from-cyan-500 to-blue-600', color: '#06b6d4' },
  SPREADSHEETS: { icon: FileSpreadsheet, gradient: 'from-emerald-500 to-green-600', color: '#10b981' },
  CODE: { icon: FileCode, gradient: 'from-amber-500 to-orange-600', color: '#f59e0b' },
  ARCHIVES: { icon: Archive, gradient: 'from-slate-500 to-gray-600', color: '#64748b' },
  PRESENTATIONS: { icon: Presentation, gradient: 'from-fuchsia-500 to-pink-600', color: '#d946ef' },
};

export function FileTypeChart({ data }: FileTypeChartProps) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-white/10 bg-card/80 backdrop-blur-sm">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500" />
        
        <CardHeader className="flex flex-row items-center justify-between pt-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieChart className="h-4 w-4 text-rose-500" />
            File Types
          </CardTitle>
          <span className="text-xs text-muted-foreground">{total} total</span>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-rose-500" />
              </div>
              <p className="text-sm text-muted-foreground">No files yet</p>
              <p className="text-xs text-muted-foreground">Upload files to see distribution</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map(([category, count], idx) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.DOCUMENTS;
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient}`}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="font-medium capitalize">{category.toLowerCase().replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">{count}</span>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-white/10">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                      />
                    </div>
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
