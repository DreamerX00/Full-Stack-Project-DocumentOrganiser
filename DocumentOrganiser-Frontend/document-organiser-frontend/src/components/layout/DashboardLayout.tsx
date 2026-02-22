'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { MobileNav } from './MobileNav';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { FileUploadDialog } from '@/components/features/files/FileUploadDialog';
import { DragDropZone } from '@/components/features/files/DragDropZone';
import { KeyboardShortcutsDialog } from '@/components/features/shortcuts/KeyboardShortcutsDialog';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { useFileStore } from '@/lib/store/fileStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { OnboardingPopup, OnboardingData } from '@/components/features/onboarding/OnboardingPopup';
import { completeOnboarding } from '@/lib/api/onboarding';
import type { UserSettingsResponse } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, session, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { uploadFiles } = useFileUpload();
  const currentFolderId = useFileStore((s) => s.currentFolderId);
  const redirectedRef = useRef(false);

  // All hooks MUST be called before any conditional returns (Rules of Hooks)
  useKeyboardShortcuts();

  // Onboarding state and hooks
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Show onboarding popup for new users (onboardingComplete not set)
  useEffect(() => {
    if (user && user.settings && user.settings.onboardingComplete !== true) {
      setOnboardingOpen(true);
    }
  }, [user]);

  // Handle onboarding completion
  const handleOnboardingComplete = async (data: OnboardingData) => {
    setOnboardingOpen(false);
    try {
      const updatedUser = await completeOnboarding({
        profession: data.profession,
        subcategory: data.subcategory,
        specialization: data.specialization,
      });
      updateUser({ settings: updatedUser.settings });
    } catch {
      // fallback: still mark onboarding as complete locally
      updateUser({
        settings: { ...user?.settings, onboardingComplete: true } as UserSettingsResponse,
      });
    }
  };

  // Handle onboarding skip
  const handleOnboardingSkip = async () => {
    setOnboardingOpen(false);
    try {
      const updatedUser = await completeOnboarding({});
      updateUser({ settings: updatedUser.settings });
    } catch {
      updateUser({
        settings: { ...user?.settings, onboardingComplete: true } as UserSettingsResponse,
      });
    }
  };

  const handleUploadClick = useCallback(() => {
    setUploadDialogOpen(true);
  }, []);

  const handleFilesDropped = useCallback(
    (files: File[]) => {
      uploadFiles(files, currentFolderId || undefined);
      setUploadDialogOpen(true);
    },
    [uploadFiles, currentFolderId]
  );

  // Only backend JWT counts as authenticated — a NextAuth session alone
  // (Google OAuth) is not enough because API calls require a backend token.
  const hasAuth = isAuthenticated;

  // True while a Google session exists but the backend token exchange hasn't finished yet.
  const isExchangingToken = !!session?.idToken && !isAuthenticated;

  // Handle unauthenticated redirect via effect to avoid render-time side effects
  useEffect(() => {
    if (!isLoading && !isExchangingToken && !hasAuth && !redirectedRef.current) {
      redirectedRef.current = true;
      router.replace('/login');
    }
  }, [isLoading, isExchangingToken, hasAuth, router]);

  // Client-side auth guard (after all hooks)
  if (isLoading || isExchangingToken) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <OnboardingPopup
        open={onboardingOpen}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
      <DragDropZone onFilesDropped={handleFilesDropped}>
        <div className="flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>

          {/* Mobile Sidebar Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-64 p-0">
              <AppSidebar />
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopNav onUploadClick={handleUploadClick} onMenuClick={() => setMobileMenuOpen(true)} />

            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>

            {/* Mobile Bottom Nav */}
            <MobileNav />
          </div>

          {/* Upload Dialog */}
          <FileUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />

          {/* Keyboard Shortcuts Dialog (triggered by ?) */}
          <KeyboardShortcutsDialog />
        </div>
      </DragDropZone>
    </>
  );
}
