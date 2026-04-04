import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-transparent shadow-sm shadow-violet-500/25 [a&]:hover:shadow-lg [a&]:hover:shadow-violet-500/30',
        secondary: 'bg-white/10 text-foreground border-white/10 backdrop-blur-sm [a&]:hover:bg-white/15',
        destructive:
          'bg-gradient-to-r from-rose-600 to-red-600 text-white border-transparent shadow-sm shadow-rose-500/25 [a&]:hover:shadow-lg',
        outline:
          'border-white/20 text-foreground bg-white/5 backdrop-blur-sm [a&]:hover:bg-white/10 [a&]:hover:border-white/30',
        ghost: 'border-transparent [a&]:hover:bg-white/10 [a&]:hover:text-accent-foreground',
        link: 'text-violet-500 underline-offset-4 border-transparent [a&]:hover:underline',
        success: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border-transparent shadow-sm shadow-emerald-500/25',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-sm shadow-amber-500/25',
        info: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-sm shadow-cyan-500/25',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
