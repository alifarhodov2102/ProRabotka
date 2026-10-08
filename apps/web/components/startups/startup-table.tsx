'use client';

import {
  Archive,
  Pencil,
  Trash2,
} from 'lucide-react';

export type Startup = {
  id: string;
  name: string;
  founderName?:
    | string
    | null;
  phone?:
    | string
    | null;
  email?:
    | string
    | null;
  stage?:
    | string
    | null;
  status: string;
  joinedAt?:
    | string
    | null;
  notes?:
    | string
    | null;
};

export default function StartupTable({
  startups,
  onEdit,
  onArchive,
  onDelete,
}: {
  startups: Startup[];

  onEdit: (
    startup: Startup,
  ) => void;

  onArchive: (
    startup: Startup,
  ) => void;

  onDelete: (
    startup: Startup,
  ) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <div className="min-w-[1050px]">
          <div className="grid grid-cols-[70px_2fr_1.5fr_1.2fr_1.2fr_1.3fr_1fr_112px] bg-[#356b5a] px-4 py-3.5 text-[12px] font-semibold text-white dark:bg-[#284f43]">
            <div className="text-center">
              T/r
            </div>

            <div>
              Startup
            </div>

            <div>
              Founder
            </div>

            <div>
              Stage
            </div>

            <div>
              Status
            </div>

            <div>
              Joined
            </div>

            <div>
              Contact
            </div>

            <div />
          </div>

          {startups.length ===
          0 ? (
            <div className="px-6 py-14 text-center text-sm text-slate-400 dark:text-slate-500">
              Startups not found.
            </div>
          ) : (
            startups.map(
              (
                startup,
                index,
              ) => (
                <div
                  key={
                    startup.id
                  }
                  className={[
                    'grid grid-cols-[70px_2fr_1.5fr_1.2fr_1.2fr_1.3fr_1fr_112px] items-center px-4 py-3.5 text-sm transition-colors',

                    index % 2 ===
                    0
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-slate-50/70 dark:bg-slate-950/40',

                    'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',

                    index !==
                    startups.length -
                      1
                      ? 'border-b border-slate-100 dark:border-slate-800'
                      : '',
                  ].join(
                    ' ',
                  )}
                >
                  <div className="text-center text-[13px] text-slate-400 dark:text-slate-500">
                    {index + 1}
                  </div>

                  <div className="min-w-0 pr-3">
                    <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {
                        startup.name
                      }
                    </p>

                    {startup.email && (
                      <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">
                        {
                          startup.email
                        }
                      </p>
                    )}
                  </div>

                  <div className="truncate text-slate-600 dark:text-slate-300">
                    {startup.founderName ||
                      '—'}
                  </div>

                  <div>
                    {startup.stage ? (
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-inset ring-violet-100 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-900/50">
                        {
                          startup.stage
                        }
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        —
                      </span>
                    )}
                  </div>

                  <div>
                    <StatusBadge
                      status={
                        startup.status
                      }
                    />
                  </div>

                  <div className="text-[13px] text-slate-600 dark:text-slate-300">
                    {startup.joinedAt
                      ? new Date(
                          startup.joinedAt,
                        ).toLocaleDateString(
                          'en-GB',
                        )
                      : '—'}
                  </div>

                  <div className="truncate text-slate-500 dark:text-slate-400">
                    {startup.phone ||
                      '—'}
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(
                          startup,
                        )
                      }
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <Pencil
                        size={14}
                      />
                    </button>

                    {startup.status !==
                      'ARCHIVED' && (
                      <button
                        type="button"
                        onClick={() =>
                          onArchive(
                            startup,
                          )
                        }
                        title="Archive"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Archive
                          size={14}
                        />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(
                          startup,
                        )
                      }
                      title="Delete"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                </div>
              ),
            )
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500 md:hidden">
        Jadvalni to‘liq ko‘rish uchun
        chapga/o‘ngga suring.
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    ACTIVE:
      'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/50',

    PAUSED:
      'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/50',

    COMPLETED:
      'bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:ring-sky-900/50',

    ARCHIVED:
      'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
  };

  const labels: Record<
    string,
    string
  > = {
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    COMPLETED: 'COMPLETED',
    ARCHIVED: 'ARCHIVED',
  };

  return (
    <span
      className={[
        'inline-flex min-w-[82px] justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',

        styles[status] ??
          'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
      ].join(' ')}
    >
      {labels[status] ??
        status}
    </span>
  );
}