import { usersApi } from '@/lib/api/users';
import type { UpdateSettingsRequest, UserSettingsResponse } from '@/lib/types';

export async function completeOnboarding(settings: Partial<UserSettingsResponse>) {
  // Mark onboarding as complete and send profession/subcategory/specialization
  const req: UpdateSettingsRequest = {
    ...settings,
    onboardingComplete: true,
  };
  return usersApi.updateSettings(req);
}
