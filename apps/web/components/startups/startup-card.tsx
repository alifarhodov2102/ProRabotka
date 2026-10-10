'use client';

import {
  ArrowUpRight,
  Banknote,
  Gift,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  apiUrl,
} from '@/lib/api';

import {
  Startup,
} from './types';

export default function StartupCard({
  startup,
}: {
  startup: Startup;
}) {
  const router =
    useRouter();

  const hasInvestment =
    startup.funding.some(
      (item) =>
        item.type ===
        'INVESTMENT',
    );

  const hasGrant =
    startup.funding.some(
      (item) =>
        item.type ===
        'GRANT',
    );

  const initials =
    startup.name
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

  const logoSrc =
    startup.logoUrl
      ? startup.logoUrl.startsWith(
          'http://',
        ) ||
        startup.logoUrl.startsWith(
          'https://',
        )
        ? startup.logoUrl
        : apiUrl(
            startup.logoUrl,
          )
      : null;

  return (
    <button
      type="button"
      onClick={() =>
        router.push(
          `/startups/${startup.id}`,
        )
      }
      className="group flex min-h-[285px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <div className="flex min-h-[135px] w-full items-center justify-center border-b border-slate-100 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-950/40">
        {logoSrc ? (
          <img
            src={
              logoSrc
            }
            alt={
              startup.name
            }
            className="max-h-20 max-w-[150px] object-contain"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 text-xl font-semibold text-white shadow-sm dark:bg-slate-700">
            {initials ||
              'S'}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              {
                startup.name
              }
            </h2>

            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {startup.founderName
                ? `Founder: ${startup.founderName}`
                : 'Founder not added'}
            </p>
          </div>

          <ArrowUpRight
            size={
              16
            }
            className="mt-0.5 shrink-0 text-slate-300 transition group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-300"
          />
        </div>

        <div className="mt-3 flex min-h-5 flex-wrap items-center gap-1.5">
          {startup.stage && (
            <span className="max-w-full truncate rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {
                startup.stage
              }
            </span>
          )}

          {startup.status !==
            'ACTIVE' && (
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium capitalize text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {startup.status
                .toLowerCase()
                .replaceAll(
                  '_',
                  ' ',
                )}
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {hasInvestment && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Banknote
                size={
                  12
                }
              />

              Investment
            </span>
          )}

          {hasGrant && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
              <Gift
                size={
                  12
                }
              />

              Grant
            </span>
          )}

          {!hasInvestment &&
            !hasGrant && (
              <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                No funding
              </span>
            )}
        </div>
      </div>
    </button>
  );
}