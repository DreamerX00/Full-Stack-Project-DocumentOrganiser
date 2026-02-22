'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Tags, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { aiApi } from '@/lib/api/ai';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AiActionsProps {
  documentId: string;
  documentName: string;
}

export function AiActions({ documentId, documentName }: AiActionsProps) {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [open, setOpen] = useState(false);

  const autoTagMutation = useMutation({
    mutationFn: () => aiApi.autoTag(documentId),
    onSuccess: (tags) => {
      setSuggestedTags(tags);
      toast.success(`${tags.length} tags applied`);
    },
    onError: () => toast.error('Auto-tagging failed'),
  });

  const suggestMutation = useMutation({
    mutationFn: () => aiApi.suggestTags(documentId),
    onSuccess: (tags) => setSuggestedTags(tags),
    onError: () => toast.error('Failed to suggest tags'),
  });

  const summarizeMutation = useMutation({
    mutationFn: () => aiApi.summarize(documentId),
    onSuccess: (result) => setSummary(result.summary),
    onError: () => toast.error('Summarization failed'),
  });

  const isLoading =
    autoTagMutation.isPending || suggestMutation.isPending || summarizeMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Tools
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Tools
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{documentName}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Auto Tagging */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isLoading}
                onClick={() => suggestMutation.mutate()}
              >
                {suggestMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Tags className="h-4 w-4" />
                )}
                Suggest Tags
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                disabled={isLoading}
                onClick={() => autoTagMutation.mutate()}
              >
                {autoTagMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Tags className="h-4 w-4" />
                )}
                Auto-Tag
              </Button>
            </div>
            {suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {suggestedTags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Summarization */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isLoading}
              onClick={() => summarizeMutation.mutate()}
            >
              {summarizeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Summarize
            </Button>
            {summary && (
              <p className="text-sm text-muted-foreground rounded-md bg-muted p-3">{summary}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
