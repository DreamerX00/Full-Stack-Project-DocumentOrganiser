import { create } from 'zustand';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  folderId?: string;
}

interface UploadState {
  queue: UploadItem[];
  isUploading: boolean;

  addToQueue: (files: File[], folderId?: string) => void;
  updateProgress: (id: string, progress: number) => void;
  setStatus: (id: string, status: UploadItem['status'], error?: string) => void;
  removeFromQueue: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  setUploading: (uploading: boolean) => void;
}

let uploadCounter = 0;

export const useUploadStore = create<UploadState>()((set) => ({
  queue: [],
  isUploading: false,

  addToQueue: (files, folderId) =>
    set((state) => ({
      queue: [
        ...state.queue,
        ...files.map((file) => ({
          id: `upload-${++uploadCounter}-${Date.now()}`,
          file,
          progress: 0,
          status: 'pending' as const,
          folderId,
        })),
      ],
    })),

  updateProgress: (id, progress) =>
    set((state) => ({
      queue: state.queue.map((item) => (item.id === id ? { ...item, progress } : item)),
    })),

  setStatus: (id, status, error) =>
    set((state) => ({
      queue: state.queue.map((item) => (item.id === id ? { ...item, status, error } : item)),
    })),

  removeFromQueue: (id) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    })),

  clearCompleted: () =>
    set((state) => ({
      queue: state.queue.filter((item) => item.status !== 'completed'),
    })),

  clearAll: () => set({ queue: [], isUploading: false }),

  setUploading: (isUploading) => set({ isUploading }),
}));
