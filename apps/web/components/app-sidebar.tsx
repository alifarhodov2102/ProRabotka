'use client';

import Link from 'next/link';

import {
  useEffect,
  useState,
} from 'react';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  LayoutDashboard,
  Users,
  Rocket,
  Building2,
  Warehouse,
  Files,
  Send,
  Search,
  LogOut,
  X,
} from 'lucide-react';

import ProRabotkaLogo from './prorabotka-logo';

const items = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },

  {
    name: 'Team',
    href: '/team',
    icon: Users,
  },

  {
    name: 'Startups',
    href: '/startups',
    icon: Rocket,
  },

  {
    name: 'Residents',
    href: '/residents',
    icon: Building2,
  },

  {
    name: 'Infrastructure',
    href: '/infrastructure',
    icon: Warehouse,
  },

  {
    name: 'Documents',
    href: '/documents',
    icon: Files,
  },

  {
    name: 'Outreach',
    href: '/outreach',
    icon: Send,
  },
];

type StoredUser = {
  name: string;
  email?: string;
  position?: string;
  role?: string;
  isSuperAdmin?: boolean;
};

export default function AppSidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const [
    user,
    setUser,
  ] =
    useState<StoredUser | null>(
      null,
    );

  useEffect(() => {
    const storedUser =
      localStorage.getItem(
        'prorabotka_user',
      );

    if (!storedUser) {
      return;
    }

    try {
      setUser(
        JSON.parse(
          storedUser,
        ),
      );
    } catch {
      localStorage.removeItem(
        'prorabotka_user',
      );
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem(
      'prorabotka_token',
    );

    localStorage.removeItem(
      'prorabotka_user',
    );

    router.replace(
      '/login',
    );
  }

  function getInitials(
    name?: string,
  ) {
    if (!name) {
      return 'U';
    }

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (
          part,
        ) =>
          part
            .charAt(0)
            .toUpperCase(),
      )
      .join('');
  }

  const userPosition =
    user?.position ||
    user?.role ||
    '';

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          onClick={
            onMobileClose
          }
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px] dark:bg-black/50 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-200 dark:border-slate-800 dark:bg-slate-900',

          collapsed
            ? 'lg:w-[72px]'
            : 'lg:w-[240px]',

          mobileOpen
            ? 'w-[240px] translate-x-0'
            : '-translate-x-full w-[240px] lg:translate-x-0',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-16 shrink-0 items-center border-b border-slate-100 dark:border-slate-800',

            collapsed
              ? 'lg:justify-center lg:px-2'
              : 'px-5',
          ].join(' ')}
        >
          <div className="flex w-full min-w-0 items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div
                className={[
                  'flex min-w-0 items-center',

                  collapsed
                    ? 'lg:justify-center'
                    : '',
                ].join(' ')}
              >
                {collapsed ? (
                  <>
                    <ProRabotkaLogo
                      compact
                      className="hidden w-9 lg:flex"
                    />

                    <ProRabotkaLogo
                      className="w-[155px] max-w-full lg:hidden"
                    />
                  </>
                ) : (
                  <ProRabotkaLogo
                    className="w-[155px] max-w-full"
                  />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={
                onMobileClose
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
              aria-label="Close sidebar"
            >
              <X
                size={
                  18
                }
              />
            </button>
          </div>
        </div>

        <div
          className={[
            'shrink-0 pt-4',

            collapsed
              ? 'lg:px-3'
              : 'px-4',
          ].join(' ')}
        >
          <button
            type="button"
            className={[
              'flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-400 transition hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',

              collapsed
                ? 'lg:w-10 lg:justify-center lg:px-0'
                : 'w-full gap-2 px-3 text-left',
            ].join(' ')}
            title={
              collapsed
                ? 'Search'
                : undefined
            }
          >
            <Search
              size={
                16
              }
              className="shrink-0"
            />

            <span
              className={
                collapsed
                  ? 'lg:hidden'
                  : ''
              }
            >
              Search
            </span>

            {!collapsed && (
              <span className="ml-auto text-[11px] text-slate-300 dark:text-slate-600">
                ⌘ K
              </span>
            )}
          </button>
        </div>

        <nav
          className={[
            'min-h-0 flex-1 overflow-y-auto py-4',

            collapsed
              ? 'lg:px-3'
              : 'px-3',
          ].join(' ')}
        >
          <div
            className={[
              'mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500',

              collapsed
                ? 'lg:hidden'
                : '',
            ].join(' ')}
          >
            Workspace
          </div>

          <div className="space-y-1">
            {items.map(
              (
                item,
              ) => {
                const active =
                  pathname ===
                    item.href ||
                  pathname.startsWith(
                    `${item.href}/`,
                  );

                const Icon =
                  item.icon;

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    onClick={
                      onMobileClose
                    }
                    title={
                      collapsed
                        ? item.name
                        : undefined
                    }
                    className={[
                      'flex h-10 items-center rounded-lg text-[14px] transition-colors',

                      collapsed
                        ? 'lg:justify-center lg:px-0'
                        : 'gap-3 px-3',

                      active
                        ? 'bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100',
                    ].join(' ')}
                  >
                    <Icon
                      size={
                        18
                      }
                      strokeWidth={
                        1.8
                      }
                      className="shrink-0"
                    />

                    <span
                      className={[
                        'truncate',

                        collapsed
                          ? 'lg:hidden'
                          : '',
                      ].join(' ')}
                    >
                      {
                        item.name
                      }
                    </span>
                  </Link>
                );
              },
            )}
          </div>
        </nav>

        <div className="shrink-0 border-t border-slate-100 p-3 dark:border-slate-800">
          <div
            className={[
              'group flex min-w-0 items-center rounded-xl transition hover:bg-slate-50 dark:hover:bg-slate-800/70',

              collapsed
                ? 'lg:justify-center lg:px-0 lg:py-2.5'
                : 'gap-3 px-3 py-2.5',
            ].join(' ')}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
              {getInitials(
                user?.name,
              )}
            </div>

            <div
              className={[
                'min-w-0 flex-1',

                collapsed
                  ? 'lg:hidden'
                  : '',
              ].join(' ')}
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                  {user?.name ??
                    'User'}
                </div>

                {user?.isSuperAdmin && (
                  <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    Admin
                  </span>
                )}
              </div>

              <div className="truncate text-xs text-slate-400 dark:text-slate-500">
                {
                  userPosition
                }
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleLogout
              }
              title="Sign out"
              aria-label="Sign out"
              className={[
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200',

                collapsed
                  ? 'lg:hidden'
                  : '',
              ].join(' ')}
            >
              <LogOut
                size={
                  16
                }
                strokeWidth={
                  1.8
                }
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}