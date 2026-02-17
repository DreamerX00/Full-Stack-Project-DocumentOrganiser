'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFileStore } from '@/lib/store/fileStore';

/**
 * Hook that adds keyboard navigation (arrow keys, Enter, Space, Delete, Esc)
 * to a CSS-grid file list.  It keeps track of a "focused" index and scrolls
 * the focused card into view.
 *
 * Returns:
 * - `focusedIndex`       – the currently focused item index (-1 = none)
 * - `gridRef`            – ref to attach to the grid container
 * - `setFocusedIndex`    – imperative setter (e.g. on mouse hover)
 */
export function useFileGridKeyboard({
    itemCount,
    onOpen,
    onDelete,
    onToggleSelection,
}: {
    itemCount: number;
    onOpen?: (index: number) => void;
    onDelete?: (index: number) => void;
    onToggleSelection?: (index: number) => void;
}) {
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const gridRef = useRef<HTMLDivElement>(null);
    const { selectedFiles, toggleFileSelection, clearSelection } = useFileStore();

    // Determine how many columns the grid currently has
    const getColumnCount = useCallback(() => {
        const grid = gridRef.current;
        if (!grid || grid.children.length === 0) return 1;
        const firstTop = (grid.children[0] as HTMLElement).offsetTop;
        let cols = 0;
        for (let i = 0; i < grid.children.length; i++) {
            if ((grid.children[i] as HTMLElement).offsetTop === firstTop) {
                cols++;
            } else {
                break;
            }
        }
        return Math.max(cols, 1);
    }, []);

    const scrollIntoView = useCallback((index: number) => {
        const grid = gridRef.current;
        if (!grid) return;
        const el = grid.children[index] as HTMLElement | undefined;
        el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Don't handle when typing in inputs
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            ) {
                return;
            }

            if (itemCount === 0) return;

            const cols = getColumnCount();

            switch (e.key) {
                case 'ArrowRight': {
                    e.preventDefault();
                    setFocusedIndex((prev) => {
                        const next = Math.min(prev + 1, itemCount - 1);
                        scrollIntoView(next);
                        return next;
                    });
                    break;
                }
                case 'ArrowLeft': {
                    e.preventDefault();
                    setFocusedIndex((prev) => {
                        const next = Math.max(prev - 1, 0);
                        scrollIntoView(next);
                        return next;
                    });
                    break;
                }
                case 'ArrowDown': {
                    e.preventDefault();
                    setFocusedIndex((prev) => {
                        const next = Math.min(prev + cols, itemCount - 1);
                        scrollIntoView(next);
                        return next;
                    });
                    break;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    setFocusedIndex((prev) => {
                        const next = Math.max(prev - cols, 0);
                        scrollIntoView(next);
                        return next;
                    });
                    break;
                }
                case 'Enter': {
                    if (focusedIndex >= 0) {
                        e.preventDefault();
                        onOpen?.(focusedIndex);
                    }
                    break;
                }
                case ' ': {
                    if (focusedIndex >= 0) {
                        e.preventDefault();
                        onToggleSelection?.(focusedIndex);
                    }
                    break;
                }
                case 'Delete':
                case 'Backspace': {
                    if (focusedIndex >= 0) {
                        e.preventDefault();
                        onDelete?.(focusedIndex);
                    }
                    break;
                }
                case 'Escape': {
                    clearSelection();
                    setFocusedIndex(-1);
                    break;
                }
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [itemCount, focusedIndex, getColumnCount, scrollIntoView, onOpen, onDelete, onToggleSelection, clearSelection]);

    return { focusedIndex, setFocusedIndex, gridRef };
}
