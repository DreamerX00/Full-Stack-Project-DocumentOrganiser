'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchApi } from '@/lib/api/search';
import { documentsApi } from '@/lib/api/documents';
import { FileGrid } from '@/components/features/files/FileGrid';
import { FileList } from '@/components/features/files/FileList';
import { EmptyState } from '@/components/features/files/EmptyState';
import { useNavigationStore } from '@/lib/store/navigationStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon, X, Tag, Clock } from 'lucide-react';
import { DocumentCategory } from '@/lib/types';
import type { DocumentResponse, SearchResultResponse } from '@/lib/types';
import { downloadBlob, getCategoryInfo } from '@/lib/utils/format';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [category, setCategory] = useState<string>('all');
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResultResponse[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [recent, tags] = await Promise.all([
          searchApi.recentSearches(),
          documentsApi.getAllTags(),
        ]);
        setRecentSearches(recent);
        setAllTags(tags);
      } catch {
        // Silently fail
      }
    };
    loadInitial();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() && activeTags.length === 0) return;
    setIsLoading(true);
    try {
      let data;
      if (activeTags.length > 0) {
        data = await searchApi.searchByTags(activeTags.join(','));
      } else {
        data = await searchApi.search(
          q,
          category !== 'all' ? (category as DocumentCategory) : undefined
        );
      }
      setDocuments(data.content);
    } catch {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [category, activeTags]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [searchParams, doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
      doSearch(query);
    }
  };

  const handleSuggest = async (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      try {
        const results = await searchApi.suggest(value);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const blob = await documentsApi.download(doc.id);
      downloadBlob(blob, doc.originalName || doc.name);
    } catch {
      toast.error('Failed to download');
    }
  };

  const hasResults = documents.length > 0;
  const hasQuery = query.trim().length > 0 || activeTags.length > 0;

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
            onChange={(e) => handleSuggest(e.target.value)}
            placeholder="Search documents..."
            className="pl-10"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); }}
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
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Badge
              key={s.id}
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setQuery(s.name);
                setSuggestions([]);
                doSearch(s.name);
              }}
            >
              {s.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Tag className="h-4 w-4" /> Filter by tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={activeTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {!hasQuery && recentSearches.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> Recent searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => {
                  setQuery(s);
                  doSearch(s);
                }}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {hasQuery && !isLoading && !hasResults ? (
        <EmptyState type="search" />
      ) : hasResults ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">{documents.length} result(s)</p>
          {viewMode === 'grid' ? (
            <FileGrid documents={documents} isLoading={isLoading} onDownload={handleDownload} />
          ) : (
            <FileList documents={documents} isLoading={isLoading} onDownload={handleDownload} />
          )}
        </div>
      ) : null}
    </div>
  );
}
