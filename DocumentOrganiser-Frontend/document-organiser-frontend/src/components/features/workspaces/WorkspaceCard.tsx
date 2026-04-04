'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, MoreHorizontal, Settings, Trash2, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { WorkspaceResponse } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/format';

interface WorkspaceCardProps {
  workspace: WorkspaceResponse;
  currentUserIsOwner?: boolean;
  onDelete?: () => void;
}

const WORKSPACE_GRADIENTS = [
  'from-violet-500/20 to-purple-600/20',
  'from-emerald-500/20 to-green-600/20',
  'from-cyan-500/20 to-blue-600/20',
  'from-amber-500/20 to-orange-600/20',
  'from-pink-500/20 to-rose-600/20',
];

export function WorkspaceCard({ workspace, currentUserIsOwner, onDelete }: WorkspaceCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Deterministic gradient based on workspace id
  const gradientIndex = workspace.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % WORKSPACE_GRADIENTS.length;
  const gradient = WORKSPACE_GRADIENTS[gradientIndex];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:border-white/20">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
        <Link href={`/workspaces/${workspace.id}`} className="absolute inset-0 z-0" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} border border-white/20 flex items-center justify-center shadow-lg`}>
                <span className="text-sm font-bold text-foreground">
                  {getInitials(workspace.name)}
                </span>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base group-hover:text-violet-500 transition-colors">
                  {workspace.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5 ring-1 ring-white/10">
                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                      {getInitials(workspace.ownerName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {workspace.ownerName}
                  </span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/workspaces/${workspace.id}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {currentUserIsOwner && onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete();
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {workspace.description && (
            <CardDescription className="line-clamp-2 mt-2 relative">
              {workspace.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
              <Users className="h-4 w-4 text-violet-500" />
              <span>{workspace.memberCount} members</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Created {formatRelativeTime(workspace.createdAt)}
            </span>
            {currentUserIsOwner && (
              <Badge variant="warning" className="text-xs gap-1">
                <Crown className="h-3 w-3" />
                Owner
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
