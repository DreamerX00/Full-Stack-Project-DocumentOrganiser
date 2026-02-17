'use client';

import { useEffect, useRef, useCallback } from 'react';
import { FileGrid } from './FileGrid';
import { Loader2 } from 'lucide-react';
import type { DocumentResponse } from '@/lib/types';

interface InfiniteFileGridProps {
    documents: DocumentResponse[];
    isLoading?: boolean;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    fetchNextPage?: () => void;
    onPreview?: (doc: DocumentResponse) => void;
    onRename?: (doc: DocumentResponse) => void;
    onDelete?: (doc: DocumentResponse) => void;
    onShare?: (doc: DocumentResponse) => void;
    onMove?: (doc: DocumentResponse) => void;
    onCopy?: (doc: DocumentResponse) => void;
    onDownload?: (doc: DocumentResponse) => void;
    onToggleFavorite?: (doc: DocumentResponse) => void;
}

/**
 * A wrapper around FileGrid that triggers infinite loading when
 * a sentinel element near the bottom scrolls into view.
 */
export function InfiniteFileGrid({
    documents,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    ...fileGridProps
}: InfiniteFileGridProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasNextPage || !fetchNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    fetchNextPage();
                }
            },
            { rootMargin: '200px' } // Start loading 200px before the sentinel is visible
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, fetchNextPage]);

    return (
        <div>
            <FileGrid
                documents={documents}
                isLoading={isLoading}
                {...fileGridProps}
            />

            {/* Sentinel for triggering next page load */}
            {hasNextPage && (
                <div ref={sentinelRef} className="flex justify-center py-6">
                    {isFetchingNextPage && (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    )}
                </div>
            )}

            {/* End of list indicator */}
            {!hasNextPage && documents.length > 0 && !isLoading && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                    All files loaded
                </p>
            )}
        </div>
    );
}
