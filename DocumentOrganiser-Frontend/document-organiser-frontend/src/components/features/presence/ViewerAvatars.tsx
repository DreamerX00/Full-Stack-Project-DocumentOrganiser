'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ViewerSummary } from '@/lib/api/presence';
import { cn } from '@/lib/utils';

interface ViewerAvatarsProps {
  /** List of viewers */
  viewers: ViewerSummary[];
  /** Maximum number of avatars to display before showing "+N" */
  maxVisible?: number;
  /** Size of the avatars */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
};

const overlapClasses = {
  sm: '-ml-2',
  md: '-ml-3',
  lg: '-ml-4',
};

/**
 * Displays a stack of user avatars showing who is currently viewing a document.
 */
export function ViewerAvatars({
  viewers,
  maxVisible = 4,
  size = 'md',
  className,
}: ViewerAvatarsProps) {
  if (viewers.length === 0) {
    return null;
  }

  const visibleViewers = viewers.slice(0, maxVisible);
  const remainingCount = viewers.length - maxVisible;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn('flex items-center', className)}>
        {visibleViewers.map((viewer, index) => (
          <Tooltip key={viewer.userId}>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  sizeClasses[size],
                  'ring-2 ring-background cursor-pointer',
                  index > 0 && overlapClasses[size]
                )}
              >
                <AvatarImage src={viewer.profilePicture} alt={viewer.userName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(viewer.userName)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="font-medium">{viewer.userName}</p>
              <p className="text-muted-foreground">{viewer.userEmail}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  sizeClasses[size],
                  'ring-2 ring-background cursor-pointer bg-muted',
                  overlapClasses[size]
                )}
              >
                <AvatarFallback className="text-muted-foreground font-medium">
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs max-w-[200px]">
              <p className="font-medium">
                {remainingCount} more {remainingCount === 1 ? 'viewer' : 'viewers'}
              </p>
              <ul className="mt-1 space-y-0.5">
                {viewers.slice(maxVisible).map((viewer) => (
                  <li key={viewer.userId} className="text-muted-foreground">
                    {viewer.userName}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
