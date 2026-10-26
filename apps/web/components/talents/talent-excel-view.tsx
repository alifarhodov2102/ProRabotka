'use client';

import { ChevronDown, Minus, Plus, Save } from 'lucide-react';
import { useState } from 'react';

import { ApiError, apiFetch } from '@/lib/api';
import type { LanguageLevel, Talent, TalentStatus } from './types';

const STATUS_OPTIONS: { value: TalentStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'AVAILABLE' },
  { value: 'OPEN_TO_OFFERS', label: 'OPEN TO OFFERS' },
  { value: 'EMPLOYED', label: 'EMPLOYED' },
  { value: 'NOT_AVAILABLE', label: 'NOT AVAILABLE' },
];

const LEVEL_OPTIONS: { value: LanguageLevel; label: string }[] = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'FLUENT', label: 'Fluent' },
  { value: 'NATIVE', label: 'Native' },
];

const GRID =
  'grid-cols-[68px_300px_180px_260px_190px_180px_120px_150px_150px_150px_170px]';

export default function TalentExcelView({
  talents,
  onChanged,
  onError,
}: {
  talents: Talent[];
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.7);

  async function patchTalent(
    talentId: string,
    patch: Record<string, unknown>,
  ) {
    try {
      setSavingId(talentId);
      onError('');
      await apiFetch(`/talents/${talentId}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      await onChanged();
    } catch (error) {
      onError(
        error instanceof ApiError ? error.message : 'Unable to update talent.',
      );
      throw error;
    } finally {
      setSavingId(null);
    }
  }

  async function patchLanguage(
    talent: Talent,
    languageName: string,
    level: string,
  ) {
    try {
      setSavingId(talent.id);
      onError('');

      const existing = talent.languages.find(
        (item) =>
          item.language.trim().toLowerCase() === languageName.toLowerCase(),
      );

      if (!level) {
        if (existing) {
          await apiFetch(
            `/talents/${talent.id}/languages/${existing.id}`,
            { method: 'DELETE' },
          );
        }
      } else if (existing) {
        await apiFetch(`/talents/${talent.id}/languages/${existing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ level }),
        });
      } else {
        await apiFetch(`/talents/${talent.id}/languages`, {
          method: 'POST',
          body: JSON.stringify({ language: languageName, level }),
        });
      }

      await onChanged();
    } catch (error) {
      onError(
        error instanceof ApiError
          ? error.message
          : 'Unable to update language.',
      );
      throw error;
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Excel view
          </p>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Edit talent data directly in the table.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savingId && (
            <div className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:flex">
              <Save size={13} />
              Saving...
            </div>
          )}

          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() =>
                setScale((current) =>
                  Math.max(0.6, Number((current - 0.1).toFixed(1))),
                )
              }
              disabled={scale <= 0.6}
              className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Minus size={14} />
            </button>
            <button
              type="button"
              onClick={() => setScale(0.7)}
              className="flex h-8 min-w-[54px] items-center justify-center border-x border-slate-200 px-2 text-xs font-semibold tabular-nums text-slate-700 dark:border-slate-700 dark:text-slate-300"
              title="Reset to 70%"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              type="button"
              onClick={() =>
                setScale((current) =>
                  Math.min(1, Number((current + 0.1).toFixed(1))),
                )
              }
              disabled={scale >= 1}
              className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-auto">
        <div className="min-w-[1910px] bg-white dark:bg-slate-950" style={{ zoom: scale }}>
          <div className={`grid ${GRID} border-b border-slate-300 dark:border-slate-700`}>
            <div className="col-span-11 flex h-12 items-center justify-center border-b border-slate-300 bg-white px-4 font-serif text-[18px] font-bold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              IT Park Sirdaryo — Talents
            </div>
          </div>

          <div className={`sticky top-0 z-20 grid ${GRID} bg-[#356b5a] text-[12px] font-bold text-white shadow-sm`}>
            {[
              'T/r',
              'Full name',
              'Phone',
              'Email',
              'Telegram',
              'Location',
              'Experience',
              'English',
              'Russian',
              'Uzbek',
              'Status',
            ].map((header) => (
              <div
                key={header}
                className="flex min-h-12 items-center justify-center border-b border-r border-[#2b594c] px-2 text-center last:border-r-0"
              >
                {header}
              </div>
            ))}
          </div>

          {talents.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm font-medium text-slate-400">
              No talents.
            </div>
          ) : (
            talents.map((talent, index) => (
              <ExcelRow
                key={talent.id}
                index={index}
                talent={talent}
                saving={savingId === talent.id}
                onPatch={(patch) => patchTalent(talent.id, patch)}
                onLanguage={(language, level) =>
                  patchLanguage(talent, language, level)
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ExcelRow({
  index,
  talent,
  saving,
  onPatch,
  onLanguage,
}: {
  index: number;
  talent: Talent;
  saving: boolean;
  onPatch: (patch: Record<string, unknown>) => Promise<void>;
  onLanguage: (language: string, level: string) => Promise<void>;
}) {
  return (
    <div
      className={[
        `grid ${GRID} text-[13px] font-semibold text-slate-900 dark:text-slate-100`,
        index % 2 === 0
          ? 'bg-white dark:bg-slate-950'
          : 'bg-slate-50/60 dark:bg-slate-900/40',
        saving ? 'opacity-70' : '',
      ].join(' ')}
    >
      <StaticCell>{index + 1}</StaticCell>
      <TextCell
        value={talent.fullName}
        required
        onSave={(value) => onPatch({ fullName: value })}
      />
      <TextCell
        value={talent.phone || ''}
        onSave={(value) => onPatch({ phone: value || null })}
      />
      <TextCell
        value={talent.email || ''}
        onSave={(value) => onPatch({ email: value || null })}
      />
      <TextCell
        value={talent.telegram || ''}
        onSave={(value) => onPatch({ telegram: value || null })}
      />
      <TextCell
        value={talent.location || ''}
        onSave={(value) => onPatch({ location: value || null })}
      />
      <NumberCell
        value={talent.experienceYears}
        onSave={(value) => onPatch({ experienceYears: value })}
      />
      <LanguageCell
        talent={talent}
        language="English"
        onSave={(level) => onLanguage('English', level)}
      />
      <LanguageCell
        talent={talent}
        language="Russian"
        onSave={(level) => onLanguage('Russian', level)}
      />
      <LanguageCell
        talent={talent}
        language="Uzbek"
        onSave={(level) => onLanguage('Uzbek', level)}
      />
      <StatusCell
        value={talent.status}
        onSave={(value) => onPatch({ status: value })}
      />
    </div>
  );
}

function StaticCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-14 items-center justify-center border-b border-r border-slate-300 px-2 dark:border-slate-700">
      {children}
    </div>
  );
}

function TextCell({
  value,
  onSave,
  required = false,
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
  required?: boolean;
}) {
  const [draft, setDraft] = useState(value);

  async function save() {
    const next = draft.trim();
    if (required && !next) {
      setDraft(value);
      return;
    }
    if (next === value.trim()) return;

    try {
      await onSave(next);
    } catch {
      setDraft(value);
    }
  }

  return (
    <div className="flex min-h-14 items-stretch border-b border-r border-slate-300 dark:border-slate-700">
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void save()}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
        className="h-14 w-full bg-transparent px-2.5 text-center text-[13px] font-semibold outline-none transition hover:bg-slate-50 focus:bg-emerald-50/70 focus:ring-2 focus:ring-inset focus:ring-emerald-300/60 dark:hover:bg-slate-900/60 dark:focus:bg-emerald-950/25"
      />
    </div>
  );
}

function NumberCell({
  value,
  onSave,
}: {
  value: number | null | undefined;
  onSave: (value: number | null) => Promise<void>;
}) {
  const [draft, setDraft] = useState(
    value === null || value === undefined ? '' : String(value),
  );

  async function save() {
    const clean = draft.trim();
    const next = clean ? Number(clean) : null;
    if (clean && (!Number.isInteger(next) || Number(next) < 0)) {
      setDraft(value === null || value === undefined ? '' : String(value));
      return;
    }

    try {
      await onSave(next);
    } catch {
      setDraft(value === null || value === undefined ? '' : String(value));
    }
  }

  return (
    <div className="flex min-h-14 items-stretch border-b border-r border-slate-300 dark:border-slate-700">
      <input
        type="number"
        min={0}
        max={100}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void save()}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
        className="h-14 w-full bg-transparent px-2.5 text-center text-[13px] font-semibold outline-none transition hover:bg-slate-50 focus:bg-emerald-50/70 focus:ring-2 focus:ring-inset focus:ring-emerald-300/60 dark:hover:bg-slate-900/60 dark:focus:bg-emerald-950/25"
      />
    </div>
  );
}

function LanguageCell({
  talent,
  language,
  onSave,
}: {
  talent: Talent;
  language: string;
  onSave: (level: string) => Promise<void>;
}) {
  const current = talent.languages.find(
    (item) => item.language.trim().toLowerCase() === language.toLowerCase(),
  );

  return (
    <div className="relative flex min-h-14 items-center border-b border-r border-slate-300 px-1 dark:border-slate-700">
      <select
        value={current?.level || ''}
        onChange={(event) => void onSave(event.target.value)}
        className="h-10 w-full appearance-none bg-transparent px-2 pr-7 text-center text-xs font-semibold text-slate-700 outline-none dark:text-slate-200"
      >
        <option value="">—</option>
        {LEVEL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function StatusCell({
  value,
  onSave,
}: {
  value: TalentStatus;
  onSave: (value: TalentStatus) => Promise<void>;
}) {
  return (
    <div className="relative flex min-h-14 items-center border-b border-slate-300 px-1 dark:border-slate-700">
      <select
        value={value}
        onChange={(event) =>
          void onSave(event.target.value as TalentStatus)
        }
        className={[
          'h-9 w-full appearance-none rounded-md border px-2 pr-7 text-center text-[10px] font-bold outline-none',
          value === 'AVAILABLE'
            ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
            : value === 'OPEN_TO_OFFERS'
              ? 'border-blue-300 bg-blue-100 text-blue-800'
              : value === 'EMPLOYED'
                ? 'border-slate-300 bg-slate-100 text-slate-700'
                : 'border-red-300 bg-red-100 text-red-700',
        ].join(' ')}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-current opacity-60"
      />
    </div>
  );
}
