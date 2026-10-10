'use client';

import {
  useEffect,
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
import ProRabotkaLogo from './prorabotka-logo';
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

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileOpen]);

  function toggleSidebar() {
    if (
      window.innerWidth <
      1024
    ) {
      setMobileOpen(
        (current) =>
          !current,
      );

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
      <div className="min-h-screen overflow-x-hidden bg-[#f7f8fa] text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
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
            'min-w-0 min-h-screen transition-all duration-200',
            collapsed
              ? 'lg:ml-[72px]'
              : 'lg:ml-[240px]',
          ].join(' ')}
        >
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#f7f8fa]/95 backdrop-blur-xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/95">
            <div className="flex h-14 min-w-0 items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={
                    toggleSidebar
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900 active:scale-[0.97] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label={
                    mobileOpen
                      ? 'Close sidebar'
                      : collapsed
                        ? 'Expand sidebar'
                        : 'Collapse sidebar'
                  }
                >
                  <Menu
                    size={20}
                    strokeWidth={
                      1.8
                    }
                  />
                </button>

                <div className="min-w-0 lg:hidden">
                  <ProRabotkaLogo className="w-[118px] max-w-full" />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <ThemeToggle />

                <NotificationBell
                  onOpenTask={
                    openTask
                  }
                />
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1700px] px-3 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}