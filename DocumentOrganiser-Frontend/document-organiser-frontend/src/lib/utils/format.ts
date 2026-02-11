import { DocumentCategory } from '@/lib/types';
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  Table,
  Presentation,
  File,
  FileSpreadsheet,
  type LucideIcon,
} from 'lucide-react';

/**
 * Format bytes to human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format date to relative time string
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format date to a readable string
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

/**
 * Get category icon & color
 */
export function getCategoryInfo(category: DocumentCategory): {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
} {
  const map: Record<
    DocumentCategory,
    { icon: LucideIcon; color: string; bgColor: string; label: string }
  > = {
    [DocumentCategory.DOCUMENTS]: {
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Documents',
    },
    [DocumentCategory.IMAGES]: {
      icon: Image,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Images',
    },
    [DocumentCategory.VIDEOS]: {
      icon: Video,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      label: 'Videos',
    },
    [DocumentCategory.AUDIO]: {
      icon: Music,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      label: 'Audio',
    },
    [DocumentCategory.ARCHIVES]: {
      icon: Archive,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Archives',
    },
    [DocumentCategory.CODE]: {
      icon: Code,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      label: 'Code',
    },
    [DocumentCategory.SPREADSHEETS]: {
      icon: FileSpreadsheet,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      label: 'Spreadsheets',
    },
    [DocumentCategory.PRESENTATIONS]: {
      icon: Presentation,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      label: 'Presentations',
    },
    [DocumentCategory.OTHERS]: {
      icon: File,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      label: 'Others',
    },
  };

  return map[category] || map[DocumentCategory.OTHERS];
}

/**
 * Get icon for a content type
 */
export function getFileIcon(contentType: string): LucideIcon {
  if (contentType.startsWith('image/')) return Image;
  if (contentType.startsWith('video/')) return Video;
  if (contentType.startsWith('audio/')) return Music;
  if (contentType.includes('pdf') || contentType.includes('document')) return FileText;
  if (contentType.includes('spreadsheet') || contentType.includes('csv')) return Table;
  if (contentType.includes('presentation')) return Presentation;
  if (contentType.includes('zip') || contentType.includes('archive') || contentType.includes('compressed'))
    return Archive;
  if (contentType.includes('text/') || contentType.includes('json') || contentType.includes('xml'))
    return Code;
  return File;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage percentage color
 */
export function getStorageColor(percentage: number): string {
  if (percentage < 60) return 'text-green-600';
  if (percentage < 80) return 'text-yellow-600';
  return 'text-red-600';
}

export function getStorageProgressColor(percentage: number): string {
  if (percentage < 60) return 'bg-green-500';
  if (percentage < 80) return 'bg-yellow-500';
  return 'bg-red-500';
}
