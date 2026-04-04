'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AmbientBackdropProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'bold';
}

const blurMap = {
  subtle: 'opacity-60',
  medium: 'opacity-80',
  bold: 'opacity-100',
};

export function AmbientBackdrop({
  className,
  intensity = 'medium',
}: AmbientBackdropProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-grid-mask opacity-50" />
      {/* Primary violet orb */}
      <motion.div
        className={cn(
          'hero-orb left-[-6rem] top-[4rem] h-56 w-56 bg-[oklch(0.65_0.2_295_/_0.28)]',
          blurMap[intensity]
        )}
        animate={{ x: [0, 24, -12, 0], y: [0, 18, 30, 0] }}
        transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      {/* Emerald accent orb */}
      <motion.div
        className={cn(
          'hero-orb right-[-4rem] top-[8rem] h-72 w-72 bg-[oklch(0.78_0.12_168_/_0.22)]',
          blurMap[intensity]
        )}
        animate={{ x: [0, -22, 12, 0], y: [0, 16, -10, 0] }}
        transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      {/* Amber warm orb */}
      <motion.div
        className={cn(
          'hero-orb bottom-[-5rem] left-1/3 h-64 w-64 bg-[oklch(0.78_0.14_85_/_0.14)]',
          blurMap[intensity]
        )}
        animate={{ x: [0, 8, -18, 0], y: [0, -22, -10, 0] }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      {/* Rose highlight orb */}
      <motion.div
        className={cn(
          'hero-orb right-1/4 bottom-[10rem] h-48 w-48 bg-[oklch(0.70_0.16_350_/_0.16)]',
          blurMap[intensity]
        )}
        animate={{ x: [0, -14, 8, 0], y: [0, 10, -14, 0] }}
        transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
    </div>
  );
}
