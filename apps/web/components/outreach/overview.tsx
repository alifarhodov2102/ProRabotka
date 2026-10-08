import {
  CalendarDays,
} from 'lucide-react';

import {
  formatDate,
} from './helpers';

import type {
  Overview,
} from './types';

export default function OutreachOverview({
  overview,
}: {
  overview:
    Overview | null;
}) {
  if (!overview) {
    return null;
  }

  const stats = [
    ['Total', overview.total],
    ['Contacted', overview.contacted],
    ['Replies', overview.replied],
    ['Meetings', overview.meetings],
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(
          ([
            label,
            value,
          ]) => (
            <div
              key={
                label
              }
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {label}
              </p>

              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {value}
              </p>
            </div>
          ),
        )}
      </div>

      {(overview.followUpsToday >
        0 ||
        overview.overdueFollowUps >
          0) && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Needs attention
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {overview.attention.map(
              (item) => (
                <div
                  key={
                    item.id
                  }
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <div
                    className={[
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',

                      item.attentionType ===
                      'OVERDUE'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
                    ].join(
                      ' ',
                    )}
                  >
                    <CalendarDays
                      size={16}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {
                        item.companyName
                      }
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                      {item.country}
                      {item.owner?.name
                        ? ` · ${item.owner.name}`
                        : ''}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={[
                        'text-xs font-medium',
                        item.attentionType ===
                        'OVERDUE'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-700 dark:text-amber-400',
                      ].join(
                        ' ',
                      )}
                    >
                      {item.attentionType ===
                      'OVERDUE'
                        ? 'Overdue'
                        : 'Today'}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                      {formatDate(
                        item.nextFollowUpAt,
                      )}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
