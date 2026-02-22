import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/lib/store/authStore';
import type { UserResponse } from '@/lib/types';

const mockUser: UserResponse = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'Test User',
  profilePicture: undefined,
  role: 'USER',
  storageUsedBytes: 1024,
  storageLimitBytes: 1073741824,
  createdAt: '2024-01-01T00:00:00Z',
  settings: {
    theme: 'system',
    language: 'en',
    defaultView: 'grid',
    sortBy: 'name',
    sortOrder: 'asc',
    notificationsEnabled: true,
    emailNotificationsEnabled: true,
    onboardingComplete: false,
  },
};

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
    localStorage.clear();
  });

  it('starts with no user and not authenticated', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('login sets user, tokens, and authentication status', () => {
    useAuthStore.getState().login(mockUser, 'access-token-123', 'refresh-token-456');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('access-token-123');
    expect(state.refreshToken).toBe('refresh-token-456');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('login stores tokens in localStorage', () => {
    useAuthStore.getState().login(mockUser, 'access-token-123', 'refresh-token-456');

    expect(localStorage.getItem('accessToken')).toBe('access-token-123');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token-456');
  });

  it('logout clears all state', () => {
    useAuthStore.getState().login(mockUser, 'access-token-123', 'refresh-token-456');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('logout clears localStorage tokens', () => {
    useAuthStore.getState().login(mockUser, 'access-token-123', 'refresh-token-456');
    useAuthStore.getState().logout();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('setUser updates user and authentication status', () => {
    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('setUser with null clears authentication', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('updateUser merges partial updates', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().updateUser({ name: 'Updated Name' });

    const state = useAuthStore.getState();
    expect(state.user?.name).toBe('Updated Name');
    expect(state.user?.email).toBe('test@example.com'); // unchanged
  });

  it('updateUser does nothing when no user is set', () => {
    useAuthStore.getState().updateUser({ name: 'Updated Name' });
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setLoading updates loading state', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('setTokens updates tokens and localStorage', () => {
    useAuthStore.getState().setTokens('new-access', 'new-refresh');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-access');
    expect(state.refreshToken).toBe('new-refresh');
    expect(localStorage.getItem('accessToken')).toBe('new-access');
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
  });
});
