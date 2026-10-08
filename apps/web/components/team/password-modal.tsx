'use client';

import {
  KeyRound,
  X,
} from 'lucide-react';

import {
  useState,
} from 'react';

export default function PasswordModal({
  open,
  memberName,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  memberName: string;
  saving: boolean;
  onClose: () => void;

  onSave: (
    password: string,
  ) => void;
}) {
  const [
    password,
    setPassword,
  ] = useState('');

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px] dark:bg-black/60">
      <button
        type="button"
        className="absolute inset-0"
        onClick={() => {
          if (!saving) {
            onClose();
          }
        }}
        aria-label="Close password modal"
      />

      <div className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <KeyRound
                size={18}
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Reset password
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {memberName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-6">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            New password
          </label>

          <input
            autoFocus
            type="password"
            value={password}
            onChange={(
              event,
            ) =>
              setPassword(
                event.target.value,
              )
            }
            placeholder="Minimum 6 characters"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-slate-500 dark:focus:ring-slate-800"
          />
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
              password.length < 6
            }
            onClick={() =>
              onSave(password)
            }
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {saving
              ? 'Saving...'
              : 'Reset password'}
          </button>
        </div>
      </div>
    </div>
  );
}