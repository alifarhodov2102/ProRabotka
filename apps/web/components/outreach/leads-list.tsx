'use client';

import {
  ChevronDown,
  Search,
  Trash2,
} from 'lucide-react';

import {
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  apiFetch,
} from '@/lib/api';

import {
  leadStatuses,
} from './constants';

import {
  formatDate,
  statusClasses,
  statusLabel,
} from './helpers';

import type {
  Campaign,
  Lead,
  LeadStatus,
  UserOption,
} from './types';

type Props = {
  leads: Lead[];
  campaigns: Campaign[];
  users: UserOption[];

  onRefresh:
    () => Promise<void>;

  onDelete: (
    lead: Lead,
  ) => void;

  onError: (
    message: string,
  ) => void;
};

export default function LeadsList({
  leads,
  campaigns,
  users,
  onRefresh,
  onDelete,
  onError,
}: Props) {
  const [
    search,
    setSearch,
  ] = useState('');

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return leads;
      }

      return leads.filter(
        (lead) =>
          [
            lead.companyName,
            lead.country,
            lead.industry,
            lead.contactName,
            lead.contactEmail,
            lead.campaign
              ?.name,
            lead.owner
              ?.name,
          ]
            .filter(Boolean)
            .some(
              (value) =>
                String(value)
                  .toLowerCase()
                  .includes(
                    query,
                  ),
            ),
      );
    }, [
      leads,
      search,
    ]);

  async function updateLead(
    leadId: string,
    patch: Record<
      string,
      unknown
    >,
  ) {
    try {
      onError('');

      await apiFetch(
        `/outreach/leads/${leadId}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify(
              patch,
            ),
        },
      );

      await onRefresh();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : 'Unable to update lead',
      );

      throw error;
    }
  }

  if (
    leads.length === 0
  ) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Leads
          </h2>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Double-click any cell
            to edit it.
          </p>
        </div>

        <div className="flex h-9 w-full max-w-xs items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900">
          <Search
            size={15}
            className="shrink-0 text-slate-400 dark:text-slate-500"
          />

          <input
            value={
              search
            }
            onChange={(
              event,
            ) =>
              setSearch(
                event.target
                  .value,
              )
            }
            placeholder="Search leads..."
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-600"
          />
        </div>
      </div>

      {filtered.length ===
      0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
          No matching leads.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <div className="min-w-[1350px]">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1.15fr_1.45fr_1.1fr_1.25fr_1.15fr_1fr_54px] border-b border-slate-200 bg-slate-50 px-3 text-[11px] font-medium uppercase tracking-[0.04em] text-slate-400 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-600">
                <HeaderCell>
                  Company
                </HeaderCell>

                <HeaderCell>
                  Country
                </HeaderCell>

                <HeaderCell>
                  Industry
                </HeaderCell>

                <HeaderCell>
                  Contact
                </HeaderCell>

                <HeaderCell>
                  Email
                </HeaderCell>

                <HeaderCell>
                  Status
                </HeaderCell>

                <HeaderCell>
                  Campaign
                </HeaderCell>

                <HeaderCell>
                  Follow-up
                </HeaderCell>

                <HeaderCell>
                  Owner
                </HeaderCell>

                <div />
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(
                  (lead) => (
                    <div
                      key={
                        lead.id
                      }
                      className="grid grid-cols-[1.5fr_1fr_1fr_1.15fr_1.45fr_1.1fr_1.25fr_1.15fr_1fr_54px] items-stretch px-3 transition hover:bg-slate-50/60 dark:hover:bg-slate-950/30"
                    >
                      <EditableTextCell
                        value={
                          lead.companyName
                        }
                        required
                        onSave={(
                          value,
                        ) =>
                          updateLead(
                            lead.id,
                            {
                              companyName:
                                value,
                            },
                          )
                        }
                      />

                      <EditableTextCell
                        value={
                          lead.country
                        }
                        required
                        onSave={(
                          value,
                        ) =>
                          updateLead(
                            lead.id,
                            {
                              country:
                                value,
                            },
                          )
                        }
                      />

                      <EditableTextCell
                        value={
                          lead.industry ||
                          ''
                        }
                        placeholder="—"
                        onSave={(
                          value,
                        ) =>
                          updateLead(
                            lead.id,
                            {
                              industry:
                                value ||
                                null,
                            },
                          )
                        }
                      />

                      <EditableTextCell
                        value={
                          lead.contactName ||
                          ''
                        }
                        placeholder="—"
                        onSave={(
                          value,
                        ) =>
                          updateLead(
                            lead.id,
                            {
                              contactName:
                                value ||
                                null,
                            },
                          )
                        }
                      />

                      <EditableTextCell
                        value={
                          lead.contactEmail ||
                          ''
                        }
                        placeholder="—"
                        type="email"
                        onSave={(
                          value,
                        ) =>
                          updateLead(
                            lead.id,
                            {
                              contactEmail:
                                value ||
                                null,
                            },
                          )
                        }
                      />

                      <EditableSelectCell
                        value={
                          lead.status
                        }
                        display={
                          <span
                            className={[
                              'inline-flex rounded-full px-2 py-1 text-[10px] font-medium',

                              statusClasses(
                                lead.status,
                              ),
                            ].join(
                              ' ',
                            )}
                          >
                            {statusLabel(
                              lead.status,
                            )}
                          </span>
                        }
                        options={
                          leadStatuses
                        }
                        onSave={(
                          value,
                        ) =>
                          updateLead(
                            lead.id,
                            {
                              status:
                                value as LeadStatus,
                            },
                          )
                        }
                      />

                      <EditableSelectCell
                        value={
                          lead.campaignId ||
                          ''
                        }
                        display={
                          lead.campaign
                            ?.name ||
                          '—'
                        }
                        options={[
                          {
                            value:
                              '',

                            label:
                              'No campaign',
                          },

                          ...campaigns.map(
                            (
                              campaign,
                            ) => ({
                              value:
                                campaign.id,

                              label:
                                campaign.name,
                            }),
                          ),
                        ]}
                        onSave={(
                          value,
                        ) =>
                          updateLead(
                            lead.id,
                            {
                              campaignId:
                                value ||
                                null,
                            },
                          )
                        }
                      />

                      <EditableDateCell
                        value={
                          lead.nextFollowUpAt ||
                          null
                        }
                        onSave={(
                          value,
                        ) =>
                          updateLead(
                            lead.id,
                            {
                              nextFollowUpAt:
                                value,
                            },
                          )
                        }
                        onError={
                          onError
                        }
                      />

                      <EditableSelectCell
                        value={
                          lead.ownerId ||
                          ''
                        }
                        display={
                          lead.owner
                            ?.name ||
                          'Me'
                        }
                        options={[
                          {
                            value:
                              '',

                            label:
                              'Me',
                          },

                          ...users.map(
                            (
                              user,
                            ) => ({
                              value:
                                user.id,

                              label:
                                user.name,
                            }),
                          ),
                        ]}
                        onSave={(
                          value,
                        ) =>
                          updateLead(
                            lead.id,
                            {
                              ownerId:
                                value ||
                                null,
                            },
                          )
                        }
                      />

                      <div className="flex items-center justify-end pr-1">
                        <button
                          type="button"
                          onClick={() =>
                            onDelete(
                              lead,
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-700 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          title="Delete lead"
                        >
                          <Trash2
                            size={
                              14
                            }
                          />
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function HeaderCell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="flex h-10 items-center px-2">
      {children}
    </div>
  );
}

function EditableTextCell({
  value,
  placeholder = '—',
  required = false,
  type = 'text',
  onSave,
}: {
  value: string;
  placeholder?: string;
  required?: boolean;
  type?: string;

  onSave: (
    value: string,
  ) => Promise<void>;
}) {
  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    draft,
    setDraft,
  ] = useState(
    value,
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const cancelRef =
    useRef(false);

  function startEditing() {
    setDraft(
      value,
    );

    setEditing(
      true,
    );
  }

  async function finishEditing() {
    if (
      cancelRef.current
    ) {
      cancelRef.current =
        false;

      return;
    }

    const clean =
      draft.trim();

    if (
      required &&
      !clean
    ) {
      setDraft(
        value,
      );

      setEditing(
        false,
      );

      return;
    }

    if (
      clean === value
    ) {
      setEditing(
        false,
      );

      return;
    }

    try {
      setSaving(true);

      await onSave(
        clean,
      );

      setEditing(
        false,
      );
    } catch {
      setDraft(
        value,
      );
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex min-h-12 items-center px-1">
        <input
          autoFocus
          type={type}
          value={
            draft
          }
          disabled={
            saving
          }
          onChange={(
            event,
          ) =>
            setDraft(
              event.target
                .value,
            )
          }
          onBlur={() =>
            void finishEditing()
          }
          onKeyDown={(
            event,
          ) => {
            if (
              event.key ===
              'Enter'
            ) {
              event.preventDefault();

              event.currentTarget.blur();
            }

            if (
              event.key ===
              'Escape'
            ) {
              event.preventDefault();

              cancelRef.current =
                true;

              setDraft(
                value,
              );

              setEditing(
                false,
              );
            }
          }}
          className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none ring-2 ring-slate-900/5 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:ring-white/5"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={
        startEditing
      }
      className="min-h-12 min-w-0 px-2 text-left text-sm text-slate-700 outline-none transition hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60"
      title="Double-click to edit"
    >
      <span className="block truncate">
        {value ||
          placeholder}
      </span>
    </button>
  );
}

function EditableSelectCell({
  value,
  display,
  options,
  onSave,
}: {
  value: string;

  display:
    React.ReactNode;

  options:
    Array<{
      value: string;
      label: string;
    }>;

  onSave: (
    value: string,
  ) => Promise<void>;
}) {
  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  async function save(
    next: string,
  ) {
    try {
      setSaving(true);

      if (
        next !== value
      ) {
        await onSave(
          next,
        );
      }

      setEditing(
        false,
      );
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex min-h-12 items-center px-1">
        <div className="relative w-full">
          <select
            autoFocus
            value={
              value
            }
            disabled={
              saving
            }
            onChange={(
              event,
            ) =>
              void save(
                event.target
                  .value,
              )
            }
            onBlur={() =>
              setEditing(
                false,
              )
            }
            className="h-8 w-full appearance-none rounded-md border border-slate-300 bg-white px-2 pr-7 text-xs text-slate-800 outline-none ring-2 ring-slate-900/5 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:ring-white/5"
          >
            {options.map(
              (
                option,
              ) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              ),
            )}
          </select>

          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={() =>
        setEditing(
          true,
        )
      }
      className="min-h-12 min-w-0 px-2 text-left text-sm text-slate-600 outline-none transition hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60"
      title="Double-click to edit"
    >
      <span className="block truncate">
        {display}
      </span>
    </button>
  );
}

function EditableDateCell({
  value,
  onSave,
  onError,
}: {
  value:
    | string
    | null;

  onSave: (
    value:
      | string
      | null,
  ) => Promise<void>;

  onError: (
    message: string,
  ) => void;
}) {
  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    draft,
    setDraft,
  ] = useState(
    isoToDisplayDate(
      value || '',
    ),
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const cancelRef =
    useRef(false);

  function startEditing() {
    setDraft(
      isoToDisplayDate(
        value || '',
      ),
    );

    setEditing(
      true,
    );
  }

  async function finishEditing() {
    if (
      cancelRef.current
    ) {
      cancelRef.current =
        false;

      return;
    }

    if (
      !draft.trim()
    ) {
      try {
        setSaving(
          true,
        );

        await onSave(
          null,
        );

        setEditing(
          false,
        );
      } finally {
        setSaving(
          false,
        );
      }

      return;
    }

    const iso =
      displayToIsoDate(
        draft,
      );

    if (!iso) {
      onError(
        'Follow-up date must be DD/MM/YYYY.',
      );

      setDraft(
        isoToDisplayDate(
          value || '',
        ),
      );

      setEditing(
        false,
      );

      return;
    }

    const oldIso =
      value
        ? value.slice(
            0,
            10,
          )
        : '';

    if (
      iso === oldIso
    ) {
      setEditing(
        false,
      );

      return;
    }

    try {
      setSaving(true);

      onError('');

      await onSave(
        iso,
      );

      setEditing(
        false,
      );
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex min-h-12 items-center px-1">
        <input
          autoFocus
          type="text"
          inputMode="numeric"
          value={
            draft
          }
          disabled={
            saving
          }
          placeholder="DD/MM/YYYY"
          onChange={(
            event,
          ) =>
            setDraft(
              maskDate(
                event.target
                  .value,
              ),
            )
          }
          onBlur={() =>
            void finishEditing()
          }
          onKeyDown={(
            event,
          ) => {
            if (
              event.key ===
              'Enter'
            ) {
              event.preventDefault();

              event.currentTarget.blur();
            }

            if (
              event.key ===
              'Escape'
            ) {
              event.preventDefault();

              cancelRef.current =
                true;

              setDraft(
                isoToDisplayDate(
                  value || '',
                ),
              );

              setEditing(
                false,
              );
            }
          }}
          className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none ring-2 ring-slate-900/5 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:ring-white/5"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={
        startEditing
      }
      className="min-h-12 min-w-0 px-2 text-left text-sm text-slate-600 outline-none transition hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60"
      title="Double-click to edit"
    >
      {value
        ? formatDate(
            value,
          )
        : '—'}
    </button>
  );
}

function maskDate(
  value: string,
) {
  const digits =
    value
      .replace(
        /\D/g,
        '',
      )
      .slice(
        0,
        8,
      );

  if (
    digits.length <= 2
  ) {
    return digits;
  }

  if (
    digits.length <= 4
  ) {
    return `${digits.slice(
      0,
      2,
    )}/${digits.slice(
      2,
    )}`;
  }

  return `${digits.slice(
    0,
    2,
  )}/${digits.slice(
    2,
    4,
  )}/${digits.slice(
    4,
  )}`;
}

function displayToIsoDate(
  value: string,
) {
  const match =
    value.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
    );

  if (!match) {
    return null;
  }

  const day =
    Number(
      match[1],
    );

  const month =
    Number(
      match[2],
    );

  const year =
    Number(
      match[3],
    );

  if (
    year < 2020 ||
    year > 2099
  ) {
    return null;
  }

  const date =
    new Date(
      year,
      month - 1,
      day,
    );

  if (
    date.getFullYear() !==
      year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !==
      day
  ) {
    return null;
  }

  return [
    String(
      year,
    ).padStart(
      4,
      '0',
    ),

    String(
      month,
    ).padStart(
      2,
      '0',
    ),

    String(
      day,
    ).padStart(
      2,
      '0',
    ),
  ].join('-');
}

function isoToDisplayDate(
  value: string,
) {
  if (!value) {
    return '';
  }

  const match =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})/,
    );

  if (!match) {
    return '';
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}