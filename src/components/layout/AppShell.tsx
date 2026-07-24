import { Outlet } from 'react-router-dom';

import { BottomNav } from '@/components/layout/BottomNav';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { AppTourInit } from '@/components/tutorial/AppTourInit';
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt';

/**
 * Shell for the authenticated tab experience: BottomNav (mobile bottom bar
 * / desktop side rail) plus a centered, max-width content column. Each
 * screen renders its own Header (title + contextual action) inside Outlet.
 */
export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col bg-background-light sm:flex-row">
      <AppTourInit />
      <UpdatePrompt />
      <BottomNav />
      <div className="flex flex-1 flex-col">
        <div className="flex justify-end border-b border-neutral-200 px-16 py-8">
          <LanguageSwitcher />
        </div>
        <main className="mx-auto flex w-full max-w-content flex-1 flex-col px-16 py-16 pb-96 sm:pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
