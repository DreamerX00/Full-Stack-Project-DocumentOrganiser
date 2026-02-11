'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharesApi } from '@/lib/api/shares';
import { toast } from 'sonner';
import type { ShareWithUserRequest, CreateShareLinkRequest, SharePermission } from '@/lib/types';

// ── Query Keys ──────────────────────────────────────────────
export const shareKeys = {
  all: ['shares'] as const,
  withMe: (page?: number) => [...shareKeys.all, 'with-me', { page }] as const,
  byMe: (page?: number) => [...shareKeys.all, 'by-me', { page }] as const,
  documentShares: (docId: string) =>
    [...shareKeys.all, 'doc', docId] as const,
  folderShares: (folderId: string) =>
    [...shareKeys.all, 'folder', folderId] as const,
  links: (page?: number) => [...shareKeys.all, 'links', { page }] as const,
  publicShare: (token: string) => [...shareKeys.all, 'public', token] as const,
};

// ── Queries ─────────────────────────────────────────────────
export function useSharedWithMe(page = 0, size = 20) {
  return useQuery({
    queryKey: shareKeys.withMe(page),
    queryFn: () => sharesApi.getSharedWithMe(page, size),
  });
}

export function useSharedByMe(page = 0, size = 20) {
  return useQuery({
    queryKey: shareKeys.byMe(page),
    queryFn: () => sharesApi.getSharedByMe(page, size),
  });
}

export function useDocumentShares(documentId: string) {
  return useQuery({
    queryKey: shareKeys.documentShares(documentId),
    queryFn: () => sharesApi.getDocumentShares(documentId),
    enabled: !!documentId,
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
      qc.invalidateQueries({ queryKey: shareKeys.byMe() });
      qc.invalidateQueries({
        queryKey: shareKeys.documentShares(variables.documentId),
      });
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
