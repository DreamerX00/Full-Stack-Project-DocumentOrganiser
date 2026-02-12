'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharesApi } from '@/lib/api/shares';
import { toast } from 'sonner';
import type { ShareWithUserRequest, CreateShareLinkRequest } from '@/lib/types';

// ── Query Keys ──────────────────────────────────────────────
export const shareKeys = {
  all: ['shares'] as const,
  docsWithMe: (page?: number) => [...shareKeys.all, 'docs-with-me', { page }] as const,
  foldersWithMe: (page?: number) => [...shareKeys.all, 'folders-with-me', { page }] as const,
  docsByMe: (page?: number) => [...shareKeys.all, 'docs-by-me', { page }] as const,
  foldersByMe: (page?: number) => [...shareKeys.all, 'folders-by-me', { page }] as const,
  links: (page?: number) => [...shareKeys.all, 'links', { page }] as const,
  publicShare: (token: string) => [...shareKeys.all, 'public', token] as const,
};

// ── Queries ─────────────────────────────────────────────────
export function useDocumentsSharedWithMe(page = 0, size = 20) {
  return useQuery({
    queryKey: shareKeys.docsWithMe(page),
    queryFn: () => sharesApi.getDocumentsSharedWithMe(page, size),
  });
}

export function useFoldersSharedWithMe(page = 0, size = 20) {
  return useQuery({
    queryKey: shareKeys.foldersWithMe(page),
    queryFn: () => sharesApi.getFoldersSharedWithMe(page, size),
  });
}

export function useDocumentsSharedByMe(page = 0, size = 20) {
  return useQuery({
    queryKey: shareKeys.docsByMe(page),
    queryFn: () => sharesApi.getDocumentsSharedByMe(page, size),
  });
}

export function useFoldersSharedByMe(page = 0, size = 20) {
  return useQuery({
    queryKey: shareKeys.foldersByMe(page),
    queryFn: () => sharesApi.getFoldersSharedByMe(page, size),
  });
}

export function useShareLinks(page = 0, size = 20) {
  return useQuery({
    queryKey: shareKeys.links(page),
    queryFn: () => sharesApi.getShareLinks(page, size),
  });
}

export function usePublicShare(token: string) {
  return useQuery({
    queryKey: shareKeys.publicShare(token),
    queryFn: () => sharesApi.getPublicShare(token),
    enabled: !!token,
  });
}

// ── Mutations ───────────────────────────────────────────────
export function useShareDocumentWithUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentId,
      data,
    }: {
      documentId: string;
      data: ShareWithUserRequest;
    }) => sharesApi.shareDocumentWithUser(documentId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: shareKeys.all });
      toast.success(`Shared with ${variables.data.email}`);
    },
    onError: () => toast.error('Failed to share'),
  });
}

export function useCreateDocumentShareLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentId,
      data,
    }: {
      documentId: string;
      data: CreateShareLinkRequest;
    }) => sharesApi.createDocumentShareLink(documentId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shareKeys.links() });
    },
    onError: () => toast.error('Failed to generate link'),
  });
}

export function useRevokeDocumentShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shareId: string) => sharesApi.revokeDocumentShare(shareId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shareKeys.all });
      toast.success('Share revoked');
    },
    onError: () => toast.error('Failed to revoke share'),
  });
}

export function useRevokeShareLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => sharesApi.revokeShareLink(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shareKeys.links() });
      toast.success('Link revoked');
    },
    onError: () => toast.error('Failed to revoke link'),
  });
}
