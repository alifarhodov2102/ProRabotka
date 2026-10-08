'use client';

import {
  Check,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

import {
  useRef,
} from 'react';

import {
  apiFetch,
} from '@/lib/api';

import {
  emptyQuickLead,
  leadStatuses,
} from './constants';

import type {
  Campaign,
  QuickLeadForm,
  UserOption,
} from './types';

type Props = {
  value: QuickLeadForm;
  campaigns: Campaign[];
  users: UserOption[];
  saving: boolean;

  onChange: (
    value: QuickLeadForm,
  ) => void;

  onSavingChange: (
    saving: boolean,
  ) => void;

  onSaved:
    () => Promise<void>;

  onError: (
    message: string,
  ) => void;
};

export default function QuickLeadEntry({
  value,
  campaigns,
  users,
  saving,
  onChange,
  onSavingChange,
  onSaved,
  onError,
}: Props) {
  const companyRef =
    useRef<HTMLInputElement>(
      null,
    );

  function update<
    K extends keyof QuickLeadForm,
  >(
    key: K,
    next:
      QuickLeadForm[K],
  ) {
    onChange({
      ...value,
      [key]: next,
    });
  }

  function reset() {
    onChange({
      ...emptyQuickLead,

      country:
        value.country,

      campaignId:
        value.campaignId,

      ownerId:
        value.ownerId,
    });

    requestAnimationFrame(
      () => {
        companyRef.current?.focus();
      },
    );
  }

  async function save() {
    const companyName =
      value.companyName.trim();

    const country =
      value.country.trim();

    if (!companyName) {
      onError(
        'Company is required.',
      );

      companyRef.current?.focus();

      return;
    }

    if (!country) {
      onError(
        'Country is required.',
      );

      return;
    }

    try {
      onSavingChange(true);
      onError('');

      await apiFetch(
        '/outreach/leads',
        {
          method: 'POST',

          body:
            JSON.stringify({
              companyName,
              country,

              industry:
                value.industry ||
                null,

              contactName:
                value.contactName ||
                null,

              contactEmail:
                value.contactEmail ||
                null,

              status:
                value.status,

              campaignId:
                value.campaignId ||
                null,

              nextFollowUpAt:
                value.nextFollowUpAt ||
                null,

              ownerId:
                value.ownerId ||
                null,

              channel:
                'LinkedIn',
            }),
        },
      );

      reset();

      await onSaved();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : 'Unable to save lead',
      );
    } finally {
      onSavingChange(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Add lead
          </h2>

          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Company and country are required.
          </p>
        </div>

        <p className="hidden text-[11px] text-slate-400 dark:text-slate-600 lg:block">
          Country, campaign and owner stay selected
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <CompactInput
          inputRef={
            companyRef
          }
          value={
            value.companyName
          }
          placeholder="Company *"
          onChange={(
            next,
          ) =>
            update(
              'companyName',
              next,
            )
          }
          onEnter={
            save
          }
        />

        <CompactInput
          value={
            value.country
          }
          placeholder="Country *"
          onChange={(
            next,
          ) =>
            update(
              'country',
              next,
            )
          }
          onEnter={
            save
          }
        />

        <CompactInput
          value={
            value.industry
          }
          placeholder="Industry"
          onChange={(
            next,
          ) =>
            update(
              'industry',
              next,
            )
          }
          onEnter={
            save
          }
        />

        <CompactInput
          value={
            value.contactName
          }
          placeholder="Contact person"
          onChange={(
            next,
          ) =>
            update(
              'contactName',
              next,
            )
          }
          onEnter={
            save
          }
        />

        <CompactInput
          type="email"
          value={
            value.contactEmail
          }
          placeholder="Email"
          onChange={(
            next,
          ) =>
            update(
              'contactEmail',
              next,
            )
          }
          onEnter={
            save
          }
        />

        <PrettySelect
          value={
            value.status
          }
          onChange={(
            next,
          ) =>
            update(
              'status',
              next as QuickLeadForm['status'],
            )
          }
          options={
            leadStatuses
          }
        />

        <PrettySelect
          value={
            value.campaignId
          }
          onChange={(
            next,
          ) =>
            update(
              'campaignId',
              next,
            )
          }
          options={[
            {
              value: '',
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
        />

        <FollowUpField
          value={
            value.nextFollowUpAt
          }
          onChange={(
            next,
          ) =>
            update(
              'nextFollowUpAt',
              next,
            )
          }
          onError={
            onError
          }
        />

        <PrettySelect
          value={
            value.ownerId
          }
          onChange={(
            next,
          ) =>
            update(
              'ownerId',
              next,
            )
          }
          options={[
            {
              value: '',
              label: 'Me',
            },

            ...users.map(
              (user) => ({
                value:
                  user.id,

                label:
                  user.name,
              }),
            ),
          ]}
        />
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={
            reset
          }
          disabled={
            saving
          }
          className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <RotateCcw
            size={14}
          />

          Clear
        </button>

        <button
          type="button"
          onClick={() =>
            void save()
          }
          disabled={
            saving
          }
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          <Check
            size={14}
            strokeWidth={
              2.2
            }
          />

          {saving
            ? 'Saving...'
            : 'Save lead'}
        </button>
      </div>
    </section>
  );
}

function CompactInput({
  value,
  onChange,
  onEnter,
  placeholder,
  type = 'text',
  inputRef,
}: {
  value: string;

  onChange: (
    value: string,
  ) => void;

  onEnter:
    () => Promise<void>;

  placeholder?:
    string;

  type?:
    string;

  inputRef?:
    React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <input
      ref={
        inputRef
      }
      type={type}
      value={value}
      placeholder={
        placeholder
      }
      onChange={(
        event,
      ) =>
        onChange(
          event.target.value,
        )
      }
      onKeyDown={(
        event,
      ) => {
        if (
          event.key ===
          'Enter'
        ) {
          event.preventDefault();

          void onEnter();
        }
      }}
      className="h-9 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-slate-600 dark:focus:bg-slate-950"
    />
  );
}

function PrettySelect({
  value,
  onChange,
  options,
}: {
  value: string;

  onChange: (
    value: string,
  ) => void;

  options:
    Array<{
      value: string;
      label: string;
    }>;
}) {
  return (
    <div className="relative">
      <select
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="h-9 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:focus:border-slate-600 dark:focus:bg-slate-950"
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
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />
    </div>
  );
}

function FollowUpField({
  value,
  onChange,
  onError,
}: {
  value: string;

  onChange: (
    value: string,
  ) => void;

  onError: (
    message: string,
  ) => void;
}) {
  const displayValue =
    isoToDisplayDate(
      value,
    );

  return (
    <input
      type="text"
      inputMode="numeric"
      value={
        displayValue
      }
      placeholder="Follow-up DD/MM/YYYY"
      onChange={(
        event,
      ) => {
        const masked =
          maskDate(
            event.target.value,
          );

        if (!masked) {
          onChange('');

          return;
        }

        if (
          masked.length === 10
        ) {
          const iso =
            displayToIsoDate(
              masked,
            );

          if (iso) {
            onError('');
            onChange(
              iso,
            );
          }

          return;
        }

        /*
         * Store temporary input separately as a
         * prefixed value so the controlled field
         * can still display incomplete DD/MM/YYYY.
         */
        onChange(
          `draft:${masked}`,
        );
      }}
      onBlur={(
        event,
      ) => {
        const masked =
          maskDate(
            event.target.value,
          );

        if (!masked) {
          onChange('');

          return;
        }

        const iso =
          displayToIsoDate(
            masked,
          );

        if (!iso) {
          onError(
            'Follow-up date must be DD/MM/YYYY.',
          );

          onChange('');

          return;
        }

        onError('');
        onChange(
          iso,
        );
      }}
      className="h-9 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-slate-600 dark:focus:bg-slate-950"
    />
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

  if (
    value.startsWith(
      'draft:',
    )
  ) {
    return value.slice(
      6,
    );
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