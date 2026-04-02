'use client';

import Link from 'next/link';
import { Users, FileText, Folder, MoreHorizontal, Settings, Trash2 } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { WorkspaceResponse } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/format';

interface WorkspaceCardProps {
  workspace: WorkspaceResponse;
  currentUserIsOwner?: boolean;
  onDelete?: () => void;
}

export function WorkspaceCard({ workspace, currentUserIsOwner, onDelete }: WorkspaceCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="group relative hover:shadow-md transition-shadow">
      <Link href={`/workspaces/${workspace.id}`} className="absolute inset-0 z-0" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {getInitials(workspace.name)}
              </span>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base group-hover:text-primary transition-colors">
                {workspace.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
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
                className="h-8 w-8 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    className="text-destructive focus:text-destructive"
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
          <CardDescription className="line-clamp-2 mt-2">
            {workspace.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{workspace.memberCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{workspace.documentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Folder className="h-4 w-4" />
            <span>{workspace.folderCount}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Created {formatRelativeTime(workspace.createdAt)}
          </span>
          {currentUserIsOwner && (
            <Badge variant="secondary" className="text-xs">Owner</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
