'use client';

import {
  X,
} from 'lucide-react';

import type {
  FormEvent,
} from 'react';

import type {
  CampaignForm,
} from './types';

export default function CampaignModal({
  value,
  editing,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  value:
    CampaignForm;

  editing:
    boolean;

  saving:
    boolean;

  onChange: (
    value:
      CampaignForm,
  ) => void;

  onClose:
    () => void;

  onSubmit: (
    event:
      FormEvent,
  ) => void;
}) {
  function update<
    K extends keyof CampaignForm,
  >(
    key: K,
    next:
      CampaignForm[K],
  ) {
    onChange({
      ...value,
      [key]: next,
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-5 backdrop-blur-[2px] dark:bg-black/60">
      <button
        type="button"
        onClick={() =>
          !saving &&
          onClose()
        }
        className="absolute inset-0"
        aria-label="Close modal"
      />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {editing
                ? 'Edit campaign'
                : 'New campaign'}
            </h2>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Keep the campaign simple. You can add leads immediately after.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              saving
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X
              size={18}
            />
          </button>
        </div>

        <form
          onSubmit={
            onSubmit
          }
        >
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <Field
              label="Campaign name"
              value={
                value.name
              }
              required
              placeholder="Philippines visit"
              onChange={(
                next,
              ) =>
                update(
                  'name',
                  next,
                )
              }
            />

            <Field
              label="Country"
              value={
                value.country
              }
              required
              placeholder="Philippines"
              onChange={(
                next,
              ) =>
                update(
                  'country',
                  next,
                )
              }
            />

            <Field
              label="City"
              value={
                value.city
              }
              placeholder="Manila"
              onChange={(
                next,
              ) =>
                update(
                  'city',
                  next,
                )
              }
            />

            <Field
              label="Target sectors"
              value={
                value.targetSectors
              }
              placeholder="BPO, IT services"
              onChange={(
                next,
              ) =>
                update(
                  'targetSectors',
                  next,
                )
              }
            />

            <Field
              label="Start date"
              type="date"
              value={
                value.startDate
              }
              onChange={(
                next,
              ) =>
                update(
                  'startDate',
                  next,
                )
              }
            />

            <Field
              label="End date"
              type="date"
              value={
                value.endDate
              }
              onChange={(
                next,
              ) =>
                update(
                  'endDate',
                  next,
                )
              }
            />

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>

              <textarea
                rows={3}
                value={
                  value.description
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'description',
                    event.target.value,
                  )
                }
                placeholder="Optional notes about this campaign"
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                saving
              }
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving
              }
              className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              {saving
                ? 'Saving...'
                : editing
                  ? 'Save changes'
                  : 'Create campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={
          required
        }
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
        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600"
      />
    </div>
  );
}
