import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  formatRelativeTime,
  getFileExtension,
  truncate,
  getStorageColor,
  getStorageProgressColor,
} from '@/lib/utils/format';

describe('formatFileSize', () => {
  it('returns "0 B" for zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('formats bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(5242880)).toBe('5 MB');
  });

  it('formats gigabytes correctly', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });
});

describe('formatRelativeTime', () => {
  it('returns "Just now" for recent dates', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('Just now');
  });

  it('returns minutes ago for dates less than an hour', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('5m ago');
  });

  it('returns hours ago for dates less than a day', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('3h ago');
  });

  it('returns days ago for dates less than a week', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe('2d ago');
  });
});

describe('getFileExtension', () => {
  it('extracts simple extensions', () => {
    expect(getFileExtension('photo.jpg')).toBe('jpg');
    expect(getFileExtension('document.pdf')).toBe('pdf');
  });

  it('handles files with multiple dots', () => {
    expect(getFileExtension('archive.tar.gz')).toBe('gz');
  });

  it('handles files with no extension', () => {
    expect(getFileExtension('Makefile')).toBe('');
  });

  it('returns lowercase extensions', () => {
    expect(getFileExtension('README.MD')).toBe('md');
  });
});

describe('truncate', () => {
  it('returns original text if shorter than max', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('returns original text if exactly max length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });
});

describe('getStorageColor', () => {
  it('returns green for usage below 60%', () => {
    expect(getStorageColor(30)).toBe('text-green-600');
    expect(getStorageColor(59)).toBe('text-green-600');
  });

  it('returns yellow for usage between 60-80%', () => {
    expect(getStorageColor(60)).toBe('text-yellow-600');
    expect(getStorageColor(79)).toBe('text-yellow-600');
  });

  it('returns red for usage above 80%', () => {
    expect(getStorageColor(80)).toBe('text-red-600');
    expect(getStorageColor(100)).toBe('text-red-600');
  });
});

describe('getStorageProgressColor', () => {
  it('returns green for usage below 60%', () => {
    expect(getStorageProgressColor(30)).toBe('bg-green-500');
  });

  it('returns yellow for usage between 60-80%', () => {
    expect(getStorageProgressColor(70)).toBe('bg-yellow-500');
  });

  it('returns red for usage above 80%', () => {
    expect(getStorageProgressColor(90)).toBe('bg-red-500');
  });
});
