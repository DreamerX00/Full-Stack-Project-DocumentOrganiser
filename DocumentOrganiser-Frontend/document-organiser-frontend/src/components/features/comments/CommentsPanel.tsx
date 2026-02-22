'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { commentsApi, CommentResponse } from '@/lib/api/comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatRelativeTime } from '@/lib/utils/format';

interface CommentsPanelProps {
  documentId: string;
  documentName: string;
}

export function CommentsPanel({ documentId, documentName }: CommentsPanelProps) {
  const [open, setOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const commentKeys = ['comments', documentId] as const;

  const { data, isLoading } = useQuery({
    queryKey: commentKeys,
    queryFn: () => commentsApi.list(documentId),
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: (content: string) => commentsApi.add(documentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys });
      setNewComment('');
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.delete(documentId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys });
      toast.success('Comment deleted');
    },
    onError: () => toast.error('Failed to delete comment'),
  });

  const comments = data?.content ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addMutation.mutate(newComment.trim());
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
          <p className="text-sm text-muted-foreground">{documentName}</p>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4 h-[calc(100vh-12rem)]">
          {/* Comment List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                No comments yet
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{comment.authorName}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteMutation.mutate(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newComment.trim() || addMutation.isPending}
            >
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
