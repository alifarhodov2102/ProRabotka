'use client';

import {
  Archive,
  Trash2,
  X,
} from 'lucide-react';

type ConfirmVariant =
  | 'archive'
  | 'delete';

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText,
  variant,
  loading = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  variant: ConfirmVariant;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  const isDelete =
    variant === 'delete';

  const Icon =
    isDelete
      ? Trash2
      : Archive;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-5 backdrop-blur-[2px] dark:bg-black/60">
      <button
        type="button"
        aria-label="Close confirmation"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-4 p-6">
          <div
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              isDelete
                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
            ].join(' ')}
          >
            <Icon
              size={20}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={loading}
            className={[
              'h-10 rounded-lg px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50',
              isDelete
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
                : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
            ].join(' ')}
          >
            {loading
              ? 'Please wait...'
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}