import { create } from 'zustand';
import type { DocumentResponse, FolderResponse } from '@/lib/types';

interface FileState {
  selectedFiles: string[];
  selectedFolders: string[];
  currentFolderId: string | null;
  documents: DocumentResponse[];
  folders: FolderResponse[];
  isLoading: boolean;

  setCurrentFolderId: (id: string | null) => void;
  setDocuments: (docs: DocumentResponse[]) => void;
  setFolders: (folders: FolderResponse[]) => void;
  setLoading: (loading: boolean) => void;

  selectFile: (id: string) => void;
  deselectFile: (id: string) => void;
  toggleFileSelection: (id: string) => void;
  selectFolder: (id: string) => void;
  deselectFolder: (id: string) => void;
  toggleFolderSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  hasSelection: () => boolean;
  selectionCount: () => number;
}

export const useFileStore = create<FileState>()((set, get) => ({
  selectedFiles: [],
  selectedFolders: [],
  currentFolderId: null,
  documents: [],
  folders: [],
  isLoading: false,

  setCurrentFolderId: (currentFolderId) => set({ currentFolderId }),
  setDocuments: (documents) => set({ documents }),
  setFolders: (folders) => set({ folders }),
  setLoading: (isLoading) => set({ isLoading }),

  selectFile: (id) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.includes(id)
        ? state.selectedFiles
        : [...state.selectedFiles, id],
    })),
  deselectFile: (id) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.filter((f) => f !== id),
    })),
  toggleFileSelection: (id) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.includes(id)
        ? state.selectedFiles.filter((f) => f !== id)
        : [...state.selectedFiles, id],
    })),
  selectFolder: (id) =>
    set((state) => ({
      selectedFolders: state.selectedFolders.includes(id)
        ? state.selectedFolders
        : [...state.selectedFolders, id],
    })),
  deselectFolder: (id) =>
    set((state) => ({
      selectedFolders: state.selectedFolders.filter((f) => f !== id),
    })),
  toggleFolderSelection: (id) =>
    set((state) => ({
      selectedFolders: state.selectedFolders.includes(id)
        ? state.selectedFolders.filter((f) => f !== id)
        : [...state.selectedFolders, id],
    })),
  selectAll: () =>
    set((state) => ({
      selectedFiles: state.documents.map((d) => d.id),
      selectedFolders: state.folders.map((f) => f.id),
    })),
  clearSelection: () => set({ selectedFiles: [], selectedFolders: [] }),

  hasSelection: () =>
    get().selectedFiles.length > 0 || get().selectedFolders.length > 0,
  selectionCount: () =>
    get().selectedFiles.length + get().selectedFolders.length,
}));
