'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { foldersApi } from '@/lib/api/folders';
import { toast } from 'sonner';
import { dashboardKeys } from './useDashboard';
import type {
  CreateFolderRequest,
  UpdateFolderRequest,
  MoveFolderRequest,
} from '@/lib/types';

// ── Query Keys ──────────────────────────────────────────────
export const folderKeys = {
  all: ['folders'] as const,
  lists: () => [...folderKeys.all, 'list'] as const,
  root: () => [...folderKeys.lists(), 'root'] as const,
  subfolders: (parentId: string) =>
    [...folderKeys.lists(), 'sub', parentId] as const,
  tree: () => [...folderKeys.all, 'tree'] as const,
  details: () => [...folderKeys.all, 'detail'] as const,
  detail: (id: string) => [...folderKeys.details(), id] as const,
};

// ── Queries ─────────────────────────────────────────────────
export function useRootFolders() {
  return useQuery({
    queryKey: folderKeys.root(),
    queryFn: () => foldersApi.listRootFolders(),
  });
}

export function useSubfolders(parentId: string) {
  return useQuery({
    queryKey: folderKeys.subfolders(parentId),
    queryFn: () => foldersApi.listSubfolders(parentId),
    enabled: !!parentId,
  });
}

export function useFolderTree() {
  return useQuery({
    queryKey: folderKeys.tree(),
    queryFn: () => foldersApi.getFolderTree(),
  });
}

export function useFolder(id: string) {
  return useQuery({
    queryKey: folderKeys.detail(id),
    queryFn: () => foldersApi.getById(id),
    enabled: !!id,
  });
}

// ── Mutations ───────────────────────────────────────────────
export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFolderRequest) => foldersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: folderKeys.lists() });
      qc.invalidateQueries({ queryKey: folderKeys.tree() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success('Folder created');
    },
    onError: () => toast.error('Failed to create folder'),
  });
}

export function useUpdateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderRequest }) =>
      foldersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: folderKeys.lists() });
      qc.invalidateQueries({ queryKey: folderKeys.tree() });
      toast.success('Folder updated');
    },
    onError: () => toast.error('Failed to update folder'),
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foldersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: folderKeys.lists() });
      qc.invalidateQueries({ queryKey: folderKeys.tree() });
      qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
      toast.success('Folder deleted');
    },
    onError: () => toast.error('Failed to delete folder'),
  });
}

export function useMoveFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveFolderRequest }) =>
      foldersApi.move(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: folderKeys.lists() });
      qc.invalidateQueries({ queryKey: folderKeys.tree() });
      toast.success('Folder moved');
    },
    onError: () => toast.error('Failed to move folder'),
  });
}
