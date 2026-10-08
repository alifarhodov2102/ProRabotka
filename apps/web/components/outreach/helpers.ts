import type {
  LeadStatus,
} from './types';

export function formatDate(
  value?: string | null,
) {
  if (!value) {
    return '—';
  }

  return new Date(
    value,
  ).toLocaleDateString(
    'en-GB',
  );
}

export function toDateInput(
  value?: string | null,
) {
  if (!value) {
    return '';
  }

  return new Date(
    value,
  )
    .toISOString()
    .slice(0, 10);
}

export function statusLabel(
  status: LeadStatus,
) {
  const labels: Record<
    LeadStatus,
    string
  > = {
    NEW: 'New',
    CONTACTED: 'Contacted',
    REPLIED: 'Replied',
    FOLLOW_UP: 'Follow up',
    MEETING_PLANNED: 'Meeting planned',
    INTERESTED: 'Interested',
    NOT_INTERESTED: 'Not interested',
    NO_RESPONSE: 'No response',
  };

  return labels[status];
}

export function statusClasses(
  status: LeadStatus,
) {
  const styles: Record<
    LeadStatus,
    string
  > = {
    NEW:
      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    CONTACTED:
      'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
    REPLIED:
      'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
    FOLLOW_UP:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    MEETING_PLANNED:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    INTERESTED:
      'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
    NOT_INTERESTED:
      'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    NO_RESPONSE:
      'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  };

  return styles[status];
}
