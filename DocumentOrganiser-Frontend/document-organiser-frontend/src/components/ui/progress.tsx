'use client';

import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const progressValue = value || 0;
  const getProgressColor = () => {
    if (progressValue >= 90) return 'from-rose-500 to-red-600';
    if (progressValue >= 75) return 'from-amber-500 to-orange-600';
    return 'from-violet-500 to-purple-600';
  };

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('bg-white/10 relative h-2 w-full overflow-hidden rounded-full backdrop-blur-sm', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn('h-full w-full flex-1 transition-all duration-500 ease-out bg-gradient-to-r', getProgressColor())}
        style={{ transform: `translateX(-${100 - progressValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
