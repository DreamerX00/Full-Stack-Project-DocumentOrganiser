'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HardDrive, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/format';

interface StorageWidgetProps {
  used: number;
  quota: number;
}

export function StorageWidget({ used, quota }: StorageWidgetProps) {
  const percent = quota > 0 ? Math.round((used / quota) * 100) : 0;
  const isWarning = percent >= 80;
  const isCritical = percent >= 95;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-white/10 bg-card/80 backdrop-blur-sm">
        {/* Gradient accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isCritical ? 'from-red-500 to-rose-600' : isWarning ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600'}`} />
        
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
          <CardTitle className="text-sm font-medium">Storage</CardTitle>
          <div className={`rounded-xl p-2 bg-gradient-to-br ${isCritical ? 'from-red-500 to-rose-600' : isWarning ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600'}`}>
            <HardDrive className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Circular progress indicator */}
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90 transform">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="url(#storage-gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - percent / 100) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="storage-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'} />
                    <stop offset="100%" stopColor={isCritical ? '#f43f5e' : isWarning ? '#ea580c' : '#14b8a6'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{percent}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-2xl font-bold">{formatFileSize(used)}</p>
              <p className="text-sm text-muted-foreground">of {formatFileSize(quota)}</p>
              <div className="flex items-center gap-1.5 mt-2">
                {isCritical ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs text-red-500 font-medium">Storage critical</span>
                  </>
                ) : isWarning ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs text-amber-500 font-medium">Running low</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs text-emerald-500 font-medium">Healthy</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Progress 
            value={percent} 
            className={`h-2 ${isCritical ? '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-rose-600' : isWarning ? '[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-600' : '[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-600'}`} 
          />
          
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Capacity insight</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {isCritical
                ? 'Consider removing unused files or upgrading your storage plan.'
                : isWarning
                ? 'You\'re approaching your storage limit. Clean up unused files.'
                : 'Your storage is well-managed with plenty of room to grow.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
