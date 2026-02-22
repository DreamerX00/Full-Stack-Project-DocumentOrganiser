import * as React from 'react';
import { cn } from '@/lib/utils';

function Kbd({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded border px-1.5 font-mono text-[11px] font-medium',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export { Kbd };
