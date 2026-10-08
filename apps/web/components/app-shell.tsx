'use client';

import {
  useState,
} from 'react';

import {
  Menu,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import AppSidebar from './app-sidebar';
import AuthGuard from './auth-guard';

import NotificationBell from './notifications/notification-bell';
import ThemeToggle from './theme-toggle';

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    collapsed,
    setCollapsed,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const router =
    useRouter();

  function toggleSidebar() {
    if (
      window.innerWidth <
      1024
    ) {
      setMobileOpen(true);
      return;
    }

    setCollapsed(
      (current) =>
        !current,
    );
  }

  function openTask(
    taskId: string,
  ) {
    router.push(
      `/dashboard?task=${taskId}`,
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f7f8fa] text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
        <AppSidebar
          collapsed={
            collapsed
          }
          mobileOpen={
            mobileOpen
          }
          onMobileClose={() =>
            setMobileOpen(
              false,
            )
          }
        />

        <main
          className={[
            'min-h-screen transition-all duration-200',
            collapsed
              ? 'lg:ml-[72px]'
              : 'lg:ml-[240px]',
          ].join(' ')}
        >
          <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-[#f7f8fa]/95 px-4 backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/95 lg:px-6">
            <button
              type="button"
              onClick={
                toggleSidebar
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label={
                mobileOpen
                  ? 'Close sidebar'
                  : collapsed
                    ? 'Expand sidebar'
                    : 'Collapse sidebar'
              }
            >
              <Menu
                size={19}
                strokeWidth={
                  1.8
                }
              />
            </button>

            <div className="flex items-center gap-1">
              <ThemeToggle />

              <NotificationBell
                onOpenTask={
                  openTask
                }
              />
            </div>
          </div>

          <div className="mx-auto max-w-[1700px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}