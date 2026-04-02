import { useState, useEffect, useCallback, useRef } from 'react';
import { presenceApi, ViewerSummary } from '@/lib/api/presence';

const HEARTBEAT_INTERVAL_MS = 30_000; // 30 seconds

interface UsePresenceOptions {
  /** Whether to automatically start tracking presence */
  enabled?: boolean;
}

interface UsePresenceReturn {
  /** Current list of viewers */
  viewers: ViewerSummary[];
  /** Whether presence data is loading */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Manually refresh the viewer list */
  refresh: () => Promise<void>;
  /** Stop presence tracking (call when leaving the page) */
  stop: () => void;
}

/**
 * Hook for tracking document presence (who's currently viewing a document).
 * Automatically sends heartbeats to keep the user in the viewers list,
 * and fetches the viewer list periodically.
 */
export function usePresence(
  documentId: string | undefined,
  options: UsePresenceOptions = {}
): UsePresenceReturn {
  const { enabled = true } = options;

  const [viewers, setViewers] = useState<ViewerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const heartbeatIntervalRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const documentIdRef = useRef(documentId);
  
  // Keep track of document ID for cleanup
  documentIdRef.current = documentId;

  const fetchViewers = useCallback(async () => {
    if (!documentId) return;

    setIsLoading(true);
    try {
      const data = await presenceApi.getViewers(documentId);
      if (isMountedRef.current) {
        setViewers(data);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch viewers'));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [documentId]);

  const sendHeartbeat = useCallback(async () => {
    if (!documentId) return;

    try {
      await presenceApi.heartbeat(documentId);
    } catch (err) {
      console.warn('Failed to send presence heartbeat:', err);
    }
  }, [documentId]);

  const stop = useCallback(() => {
    // Clear intervals
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Notify server that we're leaving
    const docId = documentIdRef.current;
    if (docId) {
      presenceApi.leave(docId).catch(() => {
        // Ignore errors on leave - user is navigating away
      });
    }
  }, []);

  // Start/stop presence tracking based on enabled flag and document ID
  useEffect(() => {
    if (!enabled || !documentId) {
      return;
    }

    isMountedRef.current = true;

    // Initial fetch and heartbeat
    fetchViewers();
    sendHeartbeat();

    // Set up periodic heartbeat
    heartbeatIntervalRef.current = window.setInterval(
      sendHeartbeat,
      HEARTBEAT_INTERVAL_MS
    );

    // Set up periodic viewer list refresh (slightly longer than heartbeat)
    pollIntervalRef.current = window.setInterval(
      fetchViewers,
      HEARTBEAT_INTERVAL_MS + 5000
    );

    return () => {
      isMountedRef.current = false;
      stop();
    };
  }, [enabled, documentId, fetchViewers, sendHeartbeat, stop]);

  // Handle page unload to send leave notification
  useEffect(() => {
    if (!enabled || !documentId) return;

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery during unload
      const docId = documentIdRef.current;
      if (docId) {
        const apiBase = '/api/backend';
        const token = localStorage.getItem('accessToken');
        
        // Try sendBeacon first for reliability
        if (navigator.sendBeacon) {
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const blob = new Blob([JSON.stringify({})], { type: 'application/json' });
          // Note: sendBeacon doesn't support custom headers well, so we'll rely on the cleanup
          navigator.sendBeacon(`${apiBase}/documents/${docId}/viewers/leave`, blob);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, documentId]);

  return {
    viewers,
    isLoading,
    error,
    refresh: fetchViewers,
    stop,
  };
}
