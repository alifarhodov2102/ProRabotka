'use client';

import {
  X,
} from 'lucide-react';

import ResidentForm from './resident-form';

type ResidentFormValue = {
  companyName: string;
  tin: string;
  activity: string;
  exporter: boolean;
  founderCountry: string;
  region: string;
  district: string;
  residentSince: string;
  focalPoint: string;
  broughtBy: string;
  status: string;
  notes: string;
};

export default function ResidentModal({
  open,
  title,
  value,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;

  value:
    ResidentFormValue;

  saving: boolean;

  onChange: (
    value: ResidentFormValue,
  ) => void;

  onClose: () => void;
  onSave: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-5 backdrop-blur-[2px] dark:bg-black/60">
      <button
        type="button"
        onClick={() => {
          if (!saving) {
            onClose();
          }
        }}
        className="absolute inset-0"
        aria-label="Close resident modal"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
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

        <div className="p-6">
          <ResidentForm
            value={value}
            onChange={
              onChange
            }
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {saving
              ? 'Saving...'
              : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}