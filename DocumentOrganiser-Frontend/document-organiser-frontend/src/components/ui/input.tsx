import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-white/5 border-white/10 h-10 w-full min-w-0 rounded-xl border px-4 py-2 text-base shadow-sm backdrop-blur-sm transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'hover:border-white/20 hover:bg-white/8',
        'focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20 focus-visible:ring-[3px] focus-visible:bg-white/10',
        'aria-invalid:ring-rose-500/20 dark:aria-invalid:ring-rose-500/40 aria-invalid:border-rose-500',
        className
      )}
      {...props}
    />
  );
}

export { Input };
