'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
      updateUser({ settings: { ...user?.settings, onboardingComplete: true } });
    }
  };

  // Handle onboarding skip
  const handleOnboardingSkip = async () => {
    setOnboardingOpen(false);
    try {
      const updatedUser = await completeOnboarding({});
      updateUser({ settings: updatedUser.settings });
    } catch {
      updateUser({ settings: { ...user?.settings, onboardingComplete: true } });
    }
  };
import { Loader2 } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, session } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { uploadFiles } = useFileUpload();
  const currentFolderId = useFileStore((s) => s.currentFolderId);
  const redirectedRef = useRef(false);

  // All hooks MUST be called before any conditional returns (Rules of Hooks)
  useKeyboardShortcuts();

  const handleUploadClick = useCallback(() => {
    setUploadDialogOpen(true);
  }, []);

  const handleFilesDropped = useCallback(
    (files: File[]) => {
      uploadFiles(files, currentFolderId || undefined);
      setUploadDialogOpen(true);
    },
    [uploadFiles, currentFolderId],
  );

  // Handle unauthenticated redirect via effect to avoid render-time side effects
  useEffect(() => {
    if (!isLoading && !session && !redirectedRef.current) {
      redirectedRef.current = true;
      // Sign out to clear any stale cookies before redirecting
      signOut({ redirect: false }).then(() => {
        router.replace('/login');
      }).catch(() => {
        router.replace('/login');
      });
    }
  }, [isLoading, session, router]);

  // Client-side auth guard (after all hooks)
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
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
          <TopNav
            onUploadClick={handleUploadClick}
            onMenuClick={() => setMobileMenuOpen(true)}
          />

          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>

          {/* Mobile Bottom Nav */}
          <MobileNav />
        </div>

        {/* Upload Dialog */}
        <FileUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
        />

        {/* Keyboard Shortcuts Dialog (triggered by ?) */}
        <KeyboardShortcutsDialog />
        </div>
      </DragDropZone>
    </>
  );
}
