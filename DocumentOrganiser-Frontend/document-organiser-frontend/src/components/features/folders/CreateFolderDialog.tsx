'use client';

import { useState } from 'react';
import { FolderPlus, Sparkles } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description?: string; color?: string }) => void;
  isLoading?: boolean;
}

const colorOptions = [
  { color: '#8B5CF6', gradient: 'from-violet-500 to-purple-600' },
  { color: '#10B981', gradient: 'from-emerald-500 to-green-600' },
  { color: '#F59E0B', gradient: 'from-amber-500 to-orange-600' },
  { color: '#EC4899', gradient: 'from-pink-500 to-rose-600' },
  { color: '#06B6D4', gradient: 'from-cyan-500 to-blue-600' },
  { color: '#EF4444', gradient: 'from-rose-500 to-red-600' },
  { color: '#3B82F6', gradient: 'from-blue-500 to-indigo-600' },
  { color: '#F97316', gradient: 'from-orange-500 to-red-600' },
];

export function CreateFolderDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateFolderDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(colorOptions[0].color);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() || undefined, color: selectedColor });
    setName('');
    setDescription('');
    setSelectedColor(colorOptions[0].color);
  };

  const getSelectedGradient = () => {
    return colorOptions.find(c => c.color === selectedColor)?.gradient || colorOptions[0].gradient;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`rounded-xl bg-gradient-to-br ${getSelectedGradient()} p-3 border border-white/20 shadow-lg`}>
              <FolderPlus className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-lg">New Folder</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Name</Label>
            <Input
              id="folderName"
              placeholder="Enter folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folderDescription">Description (optional)</Label>
            <Textarea
              id="folderDescription"
              placeholder="Add a description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  className={`h-8 w-8 rounded-xl bg-gradient-to-br ${c.gradient} border-2 transition-all duration-200 ${
                    selectedColor === c.color
                      ? 'border-white ring-2 ring-white/50 shadow-lg'
                      : 'border-transparent hover:border-white/50 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedColor(c.color)}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className={`gap-2 bg-gradient-to-r ${getSelectedGradient()} hover:opacity-90 shadow-lg transition-all`}
            >
              <Sparkles className="h-4 w-4" />
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
