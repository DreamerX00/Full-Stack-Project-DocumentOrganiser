'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api/documents';
import { toast } from 'sonner';
import { downloadBlob } from '@/lib/utils/format';
import { documentKeys } from './useDocuments';
import { dashboardKeys } from './useDashboard';
import { trashKeys } from './useTrash';
import { useFileStore } from '@/lib/store/fileStore';

/**
 * Hook providing bulk operations for selected files.
 */
export function useBulkDelete() {
    const qc = useQueryClient();
    const { clearSelection } = useFileStore();

    return useMutation({
        mutationFn: async (ids: string[]) => {
            await Promise.allSettled(ids.map((id) => documentsApi.delete(id)));
        },
        onSuccess: (_data, ids) => {
            qc.invalidateQueries({ queryKey: documentKeys.lists() });
            qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
            qc.invalidateQueries({ queryKey: trashKeys.all });
            clearSelection();
            toast.success(`Moved ${ids.length} item(s) to trash`);
        },
        onError: () => toast.error('Some items failed to delete'),
    });
}

export function useBulkDownload() {
    const { clearSelection } = useFileStore();

    return useMutation({
        mutationFn: async (docs: { id: string; name: string }[]) => {
            const results = await Promise.allSettled(
                docs.map(async (doc) => {
                    const blob = await documentsApi.download(doc.id);
                    downloadBlob(blob, doc.name);
                })
            );
            return results;
        },
        onSuccess: (_data, docs) => {
            clearSelection();
            toast.success(`Downloaded ${docs.length} file(s)`);
        },
        onError: () => toast.error('Some downloads failed'),
    });
}

export function useBulkFavorite() {
    const qc = useQueryClient();
    const { clearSelection } = useFileStore();

    return useMutation({
        mutationFn: async (ids: string[]) => {
            await Promise.allSettled(ids.map((id) => documentsApi.toggleFavorite(id)));
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: documentKeys.lists() });
            qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
            clearSelection();
            toast.success('Updated favorites');
        },
        onError: () => toast.error('Failed to update some favorites'),
    });
}

export function useBulkMove() {
    const qc = useQueryClient();
    const { clearSelection } = useFileStore();

    return useMutation({
        mutationFn: async ({
            ids,
            targetFolderId,
        }: {
            ids: string[];
            targetFolderId: string | null;
        }) => {
            await Promise.allSettled(
                ids.map((id) =>
                    documentsApi.move(id, { targetFolderId })
                )
            );
        },
        onSuccess: (_data, { ids }) => {
            qc.invalidateQueries({ queryKey: documentKeys.lists() });
            qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
            clearSelection();
            toast.success(`Moved ${ids.length} item(s)`);
        },
        onError: () => toast.error('Some items failed to move'),
    });
}
