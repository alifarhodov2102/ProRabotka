'use client';

import {
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react';

import {
  formatDate,
} from './helpers';

import type {
  Campaign,
} from './types';

export default function Campaigns({
  campaigns,
  onEdit,
  onDelete,
  onOpenLeads,
}: {
  campaigns:
    Campaign[];

  onEdit: (
    campaign:
      Campaign,
  ) => void;

  onDelete: (
    campaign:
      Campaign,
  ) => void;

  onOpenLeads: (
    campaign:
      Campaign,
  ) => void;
}) {
  if (
    campaigns.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          No campaigns yet
        </p>

        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Create one for a trip, country or market.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {campaigns.map(
        (campaign) => {
          const replies =
            campaign.leads?.filter(
              (lead) =>
                [
                  'REPLIED',
                  'MEETING_PLANNED',
                  'INTERESTED',
                ].includes(
                  lead.status,
                ),
            ).length || 0;

          const meetings =
            campaign.leads?.filter(
              (lead) =>
                lead.status ===
                'MEETING_PLANNED',
            ).length || 0;

          return (
            <article
              key={
                campaign.id
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {
                      campaign.name
                    }
                  </h3>

                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {
                      campaign.country
                    }
                    {campaign.city
                      ? ` · ${campaign.city}`
                      : ''}
                  </p>
                </div>

                <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() =>
                      onEdit(
                        campaign,
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    title="Edit campaign"
                  >
                    <Pencil
                      size={14}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onDelete(
                        campaign,
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    title="Delete campaign"
                  >
                    <Trash2
                      size={14}
                    />
                  </button>
                </div>
              </div>

              {(campaign.startDate ||
                campaign.endDate) && (
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(
                    campaign.startDate,
                  )}
                  {' — '}
                  {formatDate(
                    campaign.endDate,
                  )}
                </p>
              )}

              {campaign.targetSectors && (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {
                    campaign.targetSectors
                  }
                </p>
              )}

              <div className="mt-5 flex gap-6">
                <MiniStat
                  label="Leads"
                  value={
                    campaign._count
                      ?.leads || 0
                  }
                />

                <MiniStat
                  label="Replies"
                  value={
                    replies
                  }
                />

                <MiniStat
                  label="Meetings"
                  value={
                    meetings
                  }
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  onOpenLeads(
                    campaign,
                  )
                }
                className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                View leads

                <ChevronRight
                  size={14}
                />
              </button>
            </article>
          );
        },
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}
