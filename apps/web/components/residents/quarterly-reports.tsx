'use client';

import {
  Check,
  ChevronDown,
  Clock3,
  CircleDashed,
  FileCheck2,
  FileX2,
  Loader2,
} from 'lucide-react';

import {
  useState,
} from 'react';

import {
  apiFetch,
} from '@/lib/api';

type QuarterReport = {
  year: number;
  quarter: number;
  status: string;
};

type Resident = {
  id: string;
  companyName: string;

  quarterReports?:
    QuarterReport[];
};

type QuarterStatus =
  | 'NOT_STARTED'
  | 'WAITING'
  | 'RECEIVED'
  | 'CHECKED'
  | 'MISSING';

const statuses: Array<{
  value: QuarterStatus;
  label: string;
}> = [
  {
    value:
      'NOT_STARTED',
    label:
      'Not started',
  },

  {
    value:
      'WAITING',
    label:
      'Waiting',
  },

  {
    value:
      'RECEIVED',
    label:
      'Received',
  },

  {
    value:
      'CHECKED',
    label:
      'Checked',
  },

  {
    value:
      'MISSING',
    label:
      'Missing',
  },
];

export default function QuarterlyReports({
  residents,
  year,
  onChanged,
}: {
  residents:
    Resident[];

  year:
    number;

  onChanged:
    () => void;
}) {
  const [
    saving,
    setSaving,
  ] = useState<
    string | null
  >(null);

  function getStatus(
    resident:
      Resident,

    quarter:
      number,
  ): QuarterStatus {
    return (
      resident.quarterReports?.find(
        (item) =>
          item.year ===
            year &&
          item.quarter ===
            quarter,
      )?.status as QuarterStatus
    ) ||
      'NOT_STARTED';
  }

  async function updateStatus(
    residentId:
      string,

    quarter:
      number,

    status:
      QuarterStatus,
  ) {
    const key =
      `${residentId}-${quarter}`;

    try {
      setSaving(
        key,
      );

      await apiFetch(
        `/residents/${residentId}/reports/${year}/${quarter}`,
        {
          method:
            'PUT',

          body:
            JSON.stringify({
              status,
            }),
        },
      );

      onChanged();
    } finally {
      setSaving(
        null,
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400 dark:text-slate-600">
            Reporting
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Quarterly reports
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track report status for
            {` ${year}`}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <span>
            {
              residents.length
            }{' '}
            residents
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[2.4fr_repeat(4,1fr)] border-b border-slate-200 bg-slate-50/80 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-600">
                Resident
              </div>

              {[
                'Q1',
                'Q2',
                'Q3',
                'Q4',
              ].map(
                (
                  quarter,
                ) => (
                  <div
                    key={
                      quarter
                    }
                    className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-600"
                  >
                    {
                      quarter
                    }
                  </div>
                ),
              )}
            </div>

            {residents.length ===
            0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No residents found.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {residents.map(
                  (
                    resident,
                  ) => (
                    <div
                      key={
                        resident.id
                      }
                      className="grid grid-cols-[2.4fr_repeat(4,1fr)] items-center px-5 py-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30"
                    >
                      <div className="pr-5">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                          {
                            resident.companyName
                          }
                        </p>
                      </div>

                      {[
                        1,
                        2,
                        3,
                        4,
                      ].map(
                        (
                          quarter,
                        ) => {
                          const key =
                            `${resident.id}-${quarter}`;

                          const status =
                            getStatus(
                              resident,
                              quarter,
                            );

                          return (
                            <div
                              key={
                                quarter
                              }
                              className="pr-3"
                            >
                              <QuarterStatusSelect
                                value={
                                  status
                                }
                                saving={
                                  saving ===
                                  key
                                }
                                onChange={(
                                  next,
                                ) =>
                                  updateStatus(
                                    resident.id,
                                    quarter,
                                    next,
                                  )
                                }
                              />
                            </div>
                          );
                        },
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuarterStatusSelect({
  value,
  saving,
  onChange,
}: {
  value:
    QuarterStatus;

  saving:
    boolean;

  onChange: (
    value:
      QuarterStatus,
  ) => void;
}) {
  const config =
    getStatusConfig(
      value,
    );

  const Icon =
    config.icon;

  return (
    <div className="relative max-w-[155px]">
      <select
        value={
          value
        }
        disabled={
          saving
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value as QuarterStatus,
          )
        }
        className={[
          'peer h-9 w-full appearance-none rounded-xl border px-9 pr-8 text-xs font-medium outline-none transition',

          'focus:ring-2 focus:ring-slate-200/70 dark:focus:ring-slate-700/50',

          'disabled:cursor-not-allowed disabled:opacity-60',

          config.selectClass,
        ].join(
          ' ',
        )}
      >
        {statuses.map(
          (
            status,
          ) => (
            <option
              key={
                status.value
              }
              value={
                status.value
              }
            >
              {
                status.label
              }
            </option>
          ),
        )}
      </select>

      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        {saving ? (
          <Loader2
            size={14}
            className="animate-spin text-slate-400"
          />
        ) : (
          <Icon
            size={14}
            className={
              config.iconClass
            }
          />
        )}
      </div>

      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />
    </div>
  );
}

function getStatusConfig(
  status:
    QuarterStatus,
) {
  switch (status) {
    case 'WAITING':
      return {
        icon:
          Clock3,

        iconClass:
          'text-amber-500',

        selectClass:
          'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400',
      };

    case 'RECEIVED':
      return {
        icon:
          Check,

        iconClass:
          'text-sky-500',

        selectClass:
          'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-400',
      };

    case 'CHECKED':
      return {
        icon:
          FileCheck2,

        iconClass:
          'text-emerald-500',

        selectClass:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400',
      };

    case 'MISSING':
      return {
        icon:
          FileX2,

        iconClass:
          'text-red-500',

        selectClass:
          'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400',
      };

    default:
      return {
        icon:
          CircleDashed,

        iconClass:
          'text-slate-400 dark:text-slate-500',

        selectClass:
          'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300',
      };
  }
}