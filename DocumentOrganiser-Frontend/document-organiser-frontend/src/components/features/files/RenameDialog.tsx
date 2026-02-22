'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onRename: (newName: string) => void;
  isLoading?: boolean;
}

function RenameForm({
  currentName,
  onRename,
  onCancel,
  isLoading,
}: {
  currentName: string;
  onRename: (newName: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed && trimmed !== currentName) {
      onRename(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="rename-input">Name</Label>
          <Input
            id="rename-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onFocus={(e) => {
              const dotIndex = e.target.value.lastIndexOf('.');
              if (dotIndex > 0) {
                e.target.setSelectionRange(0, dotIndex);
              } else {
                e.target.select();
              }
            }}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !name.trim() || name.trim() === currentName}>
          {isLoading ? 'Renaming...' : 'Rename'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RenameDialog({
  open,
  onOpenChange,
  currentName,
  onRename,
  isLoading,
}: RenameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>
        {open && (
          <RenameForm
            key={currentName}
            currentName={currentName}
            onRename={onRename}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
