'use client';

import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/lib/api/activity';
import type { ActivityType } from '@/lib/types';

export const activityKeys = {
  all: ['activity'] as const,
  list: (type?: ActivityType, page?: number) =>
    [...activityKeys.all, 'list', { type, page }] as const,
};

export function useActivities(activityType?: ActivityType, page = 0, size = 20) {
  return useQuery({
    queryKey: activityKeys.list(activityType, page),
    queryFn: () =>
      activityApi.list(
        activityType,
        page,
        size,
      ),
  });
}
