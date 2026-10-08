'use client';

import {
  X,
} from 'lucide-react';

export type TeamMemberForm = {
  name: string;
  email: string;
  position: string;
  password: string;
};

export default function TeamMemberModal({
  open,
  editing,
  value,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: boolean;
  value: TeamMemberForm;
  saving: boolean;

  onChange: (
    value: TeamMemberForm,
  ) => void;

  onClose: () => void;
  onSave: () => void;
}) {
  if (!open) {
    return null;
  }

  function update<
    K extends keyof TeamMemberForm,
  >(
    key: K,
    next: TeamMemberForm[K],
  ) {
    onChange({
      ...value,
      [key]: next,
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px] dark:bg-black/60">
      <button
        type="button"
        className="absolute inset-0"
        onClick={() => {
          if (!saving) {
            onClose();
          }
        }}
        aria-label="Close team member modal"
      />

      <div className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {editing
                ? 'Edit team member'
                : 'Add team member'}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {editing
                ? 'Update member information.'
                : 'Create access for a new team member.'}
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <Field
            label="Full name"
            value={value.name}
            placeholder="Ali Farhodov"
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
            label="Email"
            type="email"
            value={value.email}
            placeholder="ali@company.com"
            onChange={(
              next,
            ) =>
              update(
                'email',
                next,
              )
            }
          />

          <Field
            label="Position"
            value={
              value.position
            }
            placeholder="Startup Manager"
            onChange={(
              next,
            ) =>
              update(
                'position',
                next,
              )
            }
          />

          {!editing && (
            <Field
              label="Temporary password"
              type="password"
              value={
                value.password
              }
              placeholder="Minimum 6 characters"
              onChange={(
                next,
              ) =>
                update(
                  'password',
                  next,
                )
              }
            />
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              saving ||
              !value.name.trim() ||
              !value.email.trim() ||
              (!editing &&
                value.password.length <
                  6)
            }
            onClick={onSave}
            className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {saving
              ? 'Saving...'
              : editing
                ? 'Save changes'
                : 'Add member'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;

  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
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
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-slate-500 dark:focus:ring-slate-800"
      />
    </div>
  );
}