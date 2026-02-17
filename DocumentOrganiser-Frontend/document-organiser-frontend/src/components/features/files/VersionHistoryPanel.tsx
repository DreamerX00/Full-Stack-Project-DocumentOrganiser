'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { History, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { documentsApi } from '@/lib/api/documents';
import { documentKeys } from '@/lib/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { formatFileSize, formatRelativeTime } from '@/lib/utils/format';
import type { DocumentResponse } from '@/lib/types';

interface VersionHistoryPanelProps {
    document: DocumentResponse;
}

export function VersionHistoryPanel({ document: doc }: VersionHistoryPanelProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: versions, isLoading } = useQuery({
        queryKey: [...documentKeys.detail(doc.id), 'versions'],
        queryFn: () => documentsApi.getVersions(doc.id),
        enabled: open,
    });

    const restoreMutation = useMutation({
        mutationFn: (versionNumber: number) =>
            documentsApi.restoreVersion(doc.id, versionNumber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: documentKeys.detail(doc.id) });
            toast.success('Version restored successfully');
        },
        onError: () => toast.error('Failed to restore version'),
    });

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <History className="h-4 w-4" />
                    Version History
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Version History</SheetTitle>
                    <p className="text-sm text-muted-foreground">{doc.name}</p>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !versions || versions.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            <History className="mx-auto mb-2 h-8 w-8" />
                            No version history available
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

                            {versions.map((version, idx) => (
                                <div key={version.id} className="relative flex gap-4 pb-6">
                                    {/* Timeline dot */}
                                    <div className={`mt-1.5 h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold ${idx === 0
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-muted-foreground/30 bg-background text-muted-foreground'
                                        }`}>
                                        {version.versionNumber}
                                    </div>

                                    <div className="flex-1 rounded-lg border p-3 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                Version {version.versionNumber}
                                                {idx === 0 && (
                                                    <span className="ml-2 text-xs text-primary">(Current)</span>
                                                )}
                                            </span>
                                            {idx > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 gap-1 text-xs"
                                                    disabled={restoreMutation.isPending}
                                                    onClick={() => restoreMutation.mutate(version.versionNumber)}
                                                >
                                                    <RotateCcw className="h-3 w-3" />
                                                    Restore
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(version.fileSize)} · {formatRelativeTime(version.createdAt)}
                                        </p>
                                        {version.changeDescription && (
                                            <p className="text-xs text-muted-foreground italic">
                                                {version.changeDescription}
                                            </p>
                                        )}
                                        {version.uploadedBy && (
                                            <p className="text-xs text-muted-foreground">
                                                by {version.uploadedBy}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
