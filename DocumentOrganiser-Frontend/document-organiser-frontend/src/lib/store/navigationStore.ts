import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ViewMode, SortField, SortDirection } from '@/lib/types';

interface NavigationState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  currentPath: { id: string; name: string }[];
  viewMode: ViewMode;
  sortBy: SortField;
  sortDirection: SortDirection;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentPath: (path: { id: string; name: string }[]) => void;
  pushPath: (item: { id: string; name: string }) => void;
  popToPath: (index: number) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      currentPath: [],
      viewMode: 'grid',
      sortBy: 'date',
      sortDirection: 'desc',

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setCurrentPath: (currentPath) => set({ currentPath }),
      pushPath: (item) =>
        set((state) => ({ currentPath: [...state.currentPath, item] })),
      popToPath: (index) =>
        set((state) => ({ currentPath: state.currentPath.slice(0, index + 1) })),
      setViewMode: (viewMode) => set({ viewMode }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortDirection: (sortDirection) => set({ sortDirection }),
    }),
    {
      name: 'navigation-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortDirection: state.sortDirection,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
