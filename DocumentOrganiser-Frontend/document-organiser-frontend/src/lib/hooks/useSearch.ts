'use client';

import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/lib/api/search';
import type { DocumentCategory } from '@/lib/types';
import { useEffect, useState } from 'react';

// ── Query Keys ──────────────────────────────────────────────
export const searchKeys = {
  all: ['search'] as const,
  combined: (q: string) => [...searchKeys.all, 'combined', q] as const,
  documents: (params: Record<string, unknown>) =>
    [...searchKeys.all, 'documents', params] as const,
  folders: (q: string, page?: number) =>
    [...searchKeys.all, 'folders', { q, page }] as const,
  suggestions: (q: string) => [...searchKeys.all, 'suggest', q] as const,
};

// ── Queries ─────────────────────────────────────────────────

/** Combined search (documents + folders) via GET /search */
export function useCombinedSearch(query: string, limit = 10) {
  return useQuery({
    queryKey: searchKeys.combined(query),
    queryFn: () => searchApi.search(query, limit),
    enabled: query.trim().length > 0,
  });
}

/** Document search via GET /search/documents */
export function useSearchDocuments(
  query: string,
  category?: DocumentCategory,
  contentType?: string,
  page = 0,
  size = 20,
  enabled = true
) {
  return useQuery({
    queryKey: searchKeys.documents({ query, category, contentType, page }),
    queryFn: () => searchApi.searchDocuments(query, category, contentType, page, size),
    enabled: enabled && query.trim().length > 0,
  });
}

/** Folder search via GET /search/folders */
export function useSearchFolders(query: string, page = 0, size = 20) {
  return useQuery({
    queryKey: searchKeys.folders(query, page),
    queryFn: () => searchApi.searchFolders(query, page, size),
    enabled: query.trim().length > 0,
  });
}

/** Suggestions via GET /search/suggestions */
export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: searchKeys.suggestions(query),
    queryFn: () => searchApi.suggest(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}

// ── Debounced Search Hook ───────────────────────────────────
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
