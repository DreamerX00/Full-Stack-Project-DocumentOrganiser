'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { EmptyState } from '@/components/features/files/EmptyState';
import { useNavigationStore } from '@/lib/store/navigationStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon, X } from 'lucide-react';
import { DocumentCategory } from '@/lib/types';
import type { DocumentResponse } from '@/lib/types';
import { getCategoryInfo } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useSearchDocuments,
  useSearchSuggestions,
  useDebouncedValue,
} from '@/lib/hooks/useSearch';
import { useAllTags, useToggleFavorite, useDownloadDocument } from '@/lib/hooks/useDocuments';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { viewMode } = useNavigationStore();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [submittedQuery, setSubmittedQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState<string>('all');

  const debouncedQuery = useDebouncedValue(query, 300);

  // React Query hooks
  const { data: searchData, isLoading: searchLoading } = useSearchDocuments(
    submittedQuery,
    category !== 'all' ? (category as DocumentCategory) : undefined,
    undefined,
    0,
    20,
    submittedQuery.trim().length > 0,
  );
  const { data: suggestions } = useSearchSuggestions(debouncedQuery);
  const { data: allTags } = useAllTags();
  const toggleFavorite = useToggleFavorite();
  const downloadDoc = useDownloadDocument();

  const isLoading = searchLoading;
  const documents = searchData?.content ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSubmittedQuery(query.trim());
      router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const hasResults = documents.length > 0;
  const hasQuery = submittedQuery.trim().length > 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-muted-foreground">Find your documents quickly</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="pl-10"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSubmittedQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.values(DocumentCategory).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryInfo(cat).label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isLoading}>
          Search
        </Button>
      </form>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && !submittedQuery && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setQuery(s);
                setSubmittedQuery(s);
              }}
            >
              {s}
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Filters */}
      {allTags && allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Results */}
      {hasQuery && !isLoading && !hasResults ? (
        <EmptyState type="search" />
      ) : hasResults ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">{searchData?.totalElements ?? documents.length} result(s)</p>
          {viewMode === 'grid' ? (
            <FileGrid
              documents={documents}
              isLoading={isLoading}
              onDownload={(doc) => downloadDoc.mutate(doc)}
              onToggleFavorite={(doc) => toggleFavorite.mutate(doc.id)}
            />
          ) : (
            <FileList
              documents={documents}
              isLoading={isLoading}
              onDownload={(doc) => downloadDoc.mutate(doc)}
              onToggleFavorite={(doc) => toggleFavorite.mutate(doc.id)}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
