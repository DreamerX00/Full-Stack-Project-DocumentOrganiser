'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchApi } from '@/lib/api/search';
import type { DocumentCategory } from '@/lib/types';
import { useCallback, useEffect, useRef, useState } from 'react';

// ── Query Keys ──────────────────────────────────────────────
export const searchKeys = {
  all: ['search'] as const,
  results: (params: Record<string, unknown>) =>
    [...searchKeys.all, 'results', params] as const,
  suggestions: (q: string) => [...searchKeys.all, 'suggest', q] as const,
  byTags: (tags: string, page?: number) =>
    [...searchKeys.all, 'tags', { tags, page }] as const,
  recent: () => [...searchKeys.all, 'recent'] as const,
};

// ── Queries ─────────────────────────────────────────────────
export function useSearchDocuments(
  query: string,
  category?: DocumentCategory,
  contentType?: string,
  page = 0,
  size = 20,
  enabled = true
) {
  return useQuery({
    queryKey: searchKeys.results({ query, category, contentType, page }),
    queryFn: () => searchApi.search(query, category, contentType, page, size),
    enabled: enabled && query.trim().length > 0,
  });
}

export function useSearchByTags(tags: string[], page = 0, size = 20) {
  const joined = tags.join(',');
  return useQuery({
    queryKey: searchKeys.byTags(joined, page),
    queryFn: () => searchApi.searchByTags(joined, page, size),
    enabled: tags.length > 0,
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: searchKeys.suggestions(query),
    queryFn: () => searchApi.suggest(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}

export function useRecentSearches() {
  return useQuery({
    queryKey: searchKeys.recent(),
    queryFn: () => searchApi.recentSearches(),
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
