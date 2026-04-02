'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Trash2, Loader2, Pencil, X, Check, CornerDownRight } from 'lucide-react';
import { toast } from 'sonner';
import { commentsApi, CommentResponse } from '@/lib/api/comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/authStore';

interface CommentsPanelProps {
  documentId: string;
  documentName: string;
}

interface CommentItemProps {
  comment: CommentResponse;
  documentId: string;
  currentUserEmail?: string;
  onReply?: (parentId: string) => void;
  isReply?: boolean;
}

function CommentItem({
  comment,
  documentId,
  currentUserEmail,
  onReply,
  isReply = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const queryClient = useQueryClient();
  const commentKeys = ['comments', documentId] as const;

  const isOwner = currentUserEmail === comment.authorEmail;

  const updateMutation = useMutation({
    mutationFn: (content: string) => commentsApi.update(documentId, comment.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys });
      setIsEditing(false);
      toast.success('Comment updated');
    },
    onError: () => toast.error('Failed to update comment'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => commentsApi.delete(documentId, comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys });
      toast.success('Comment deleted');
    },
    onError: () => toast.error('Failed to delete comment'),
  });

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== comment.content) {
      updateMutation.mutate(editContent.trim());
    } else {
      setIsEditing(false);
      setEditContent(comment.content);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('rounded-lg border p-3 space-y-2', isReply && 'ml-6 border-l-2 border-l-primary/20')}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.authorProfilePicture} alt={comment.authorName} />
          <AvatarFallback className="text-xs">{getInitials(comment.authorName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium truncate">{comment.authorName}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground italic shrink-0">(edited)</span>
              )}
            </div>
            {isOwner && !isEditing && (
              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsEditing(true)}
                  title="Edit comment"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  title="Delete comment"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={updateMutation.isPending}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending || !editContent.trim()}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{comment.content}</p>
          )}

          {!isReply && onReply && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 mt-1 text-xs"
              onClick={() => onReply(comment.id)}
            >
              <CornerDownRight className="h-3 w-3 mr-1" />
              Reply
              {comment.replyCount > 0 && <span className="ml-1">({comment.replyCount})</span>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentsPanel({ documentId, documentName }: CommentsPanelProps) {
  const [open, setOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const commentKeys = ['comments', documentId] as const;

  const { data, isLoading } = useQuery({
    queryKey: commentKeys,
    queryFn: () => commentsApi.list(documentId),
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      commentsApi.add(documentId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys });
      setNewComment('');
      setReplyingTo(null);
      toast.success(replyingTo ? 'Reply added' : 'Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const allComments = data?.content ?? [];
  // Separate top-level comments and replies
  const topLevelComments = allComments.filter((c) => !c.parentId);
  const replies = allComments.filter((c) => c.parentId);
  const repliesMap = new Map<string, CommentResponse[]>();
  replies.forEach((r) => {
    const existing = repliesMap.get(r.parentId!) ?? [];
    existing.push(r);
    repliesMap.set(r.parentId!, existing);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addMutation.mutate({
        content: newComment.trim(),
        parentId: replyingTo ?? undefined,
      });
    }
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    // Focus on the textarea
    const textarea = document.querySelector('textarea[name="new-comment"]');
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.focus();
    }
  };

  const replyingToComment = replyingTo
    ? allComments.find((c) => c.id === replyingTo)
    : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
          <p className="text-sm text-muted-foreground truncate">{documentName}</p>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4 h-[calc(100vh-12rem)]">
          {/* Comment List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : topLevelComments.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                No comments yet
              </div>
            ) : (
              topLevelComments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <CommentItem
                    comment={comment}
                    documentId={documentId}
                    currentUserEmail={user?.email}
                    onReply={handleReply}
                  />
                  {/* Render replies */}
                  {repliesMap.get(comment.id)?.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      documentId={documentId}
                      currentUserEmail={user?.email}
                      isReply
                    />
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Reply indicator */}
          {replyingToComment && (
            <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md text-sm">
              <CornerDownRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Replying to</span>
              <span className="font-medium truncate">{replyingToComment.authorName}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-auto"
                onClick={() => setReplyingTo(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* New Comment Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              name="new-comment"
              placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
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
