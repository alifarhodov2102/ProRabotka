'use client';

import {
  Check,
  ChevronDown,
  Filter,
  Minus,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError, apiFetch } from '@/lib/api';
import type {
  LanguageLevel,
  Talent,
  TalentStatus,
} from './types';

type QuickTalent = {
  fullName: string;
  phone: string;
  email: string;
  telegram: string;
  location: string;
  experienceYears: string;
  englishLevel: '' | LanguageLevel;
  russianLevel: '' | LanguageLevel;
  uzbekLevel: '' | LanguageLevel;
  status: TalentStatus;
};

type Filters = {
  fullName: string;
  phone: string;
  email: string;
  telegram: string;
  location: string;
  language: string;
  status: string;
};

const EMPTY_QUICK: QuickTalent = {
  fullName: '',
  phone: '',
  email: '',
  telegram: '',
  location: '',
  experienceYears: '',
  englishLevel: '',
  russianLevel: '',
  uzbekLevel: '',
  status: 'AVAILABLE',
};

const EMPTY_FILTERS: Filters = {
  fullName: '',
  phone: '',
  email: '',
  telegram: '',
  location: '',
  language: '',
  status: '',
};

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
  'grid-cols-[58px_2fr_1.25fr_1.6fr_1.2fr_1.25fr_0.9fr_1fr_1fr_1fr_1.35fr_82px]';

export default function TalentTable({
  talents,
  onChanged,
  onDelete,
  onError,
}: {
  talents: Talent[];
  onChanged: () => Promise<void>;
  onDelete: (talent: Talent) => void;
  onError: (message: string) => void;
}) {
  const router = useRouter();
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickSaving, setQuickSaving] = useState(false);
  const [quick, setQuick] = useState<QuickTalent>({ ...EMPTY_QUICK });
  const [scale, setScale] = useState(0.9);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS });

  const filteredTalents = useMemo(() => {
    const includes = (value: unknown, query: string) =>
      !query.trim() ||
      String(value ?? '')
        .toLowerCase()
        .includes(query.trim().toLowerCase());

    return talents.filter((talent) => {
      if (!includes(talent.fullName, filters.fullName)) return false;
      if (!includes(talent.phone, filters.phone)) return false;
      if (!includes(talent.email, filters.email)) return false;
      if (!includes(talent.telegram, filters.telegram)) return false;
      if (!includes(talent.location, filters.location)) return false;
      if (filters.status && talent.status !== filters.status) return false;

      if (filters.language) {
        const q = filters.language.trim().toLowerCase();
        const found = talent.languages.some((item) =>
          `${item.language} ${item.level}`.toLowerCase().includes(q),
        );
        if (!found) return false;
      }

      return true;
    });
  }, [talents, filters]);

  const activeFilterCount = Object.values(filters).filter((value) =>
    Boolean(value.trim()),
  ).length;

  async function updateTalent(
    talentId: string,
    patch: Record<string, unknown>,
  ) {
    try {
      onError('');
      await apiFetch(`/talents/${talentId}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      await onChanged();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Unable to update talent.';
      onError(message);
      throw error;
    }
  }

  async function updateLanguage(
    talent: Talent,
    languageName: string,
    level: string,
  ) {
    try {
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
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to update language.';
      onError(message);
      throw error;
    }
  }

  async function saveQuickTalent() {
    const fullName = quick.fullName.trim();
    if (!fullName) {
      onError('Full name is required.');
      return;
    }

    try {
      setQuickSaving(true);
      onError('');

      const talent = await apiFetch<Talent>('/talents', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          phone: quick.phone.trim() || null,
          email: quick.email.trim() || null,
          telegram: quick.telegram.trim() || null,
          location: quick.location.trim() || null,
          experienceYears: quick.experienceYears
            ? Number(quick.experienceYears)
            : null,
          status: quick.status,
        }),
      });

      const languages = [
        ['English', quick.englishLevel],
        ['Russian', quick.russianLevel],
        ['Uzbek', quick.uzbekLevel],
      ] as const;

      for (const [language, level] of languages) {
        if (!level) continue;
        await apiFetch(`/talents/${talent.id}/languages`, {
          method: 'POST',
          body: JSON.stringify({ language, level }),
        });
      }

      setQuick({ ...EMPTY_QUICK });
      setQuickOpen(false);
      await onChanged();
    } catch (error) {
      onError(
        error instanceof ApiError ? error.message : 'Unable to create talent.',
      );
    } finally {
      setQuickSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((current) => !current)}
            className={[
              'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition',
              filtersOpen || activeFilterCount > 0
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
            ].join(' ')}
          >
            <Filter size={13} />
            Filter
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <ZoomControl scale={scale} onChange={setScale} />
        </div>

        <button
          type="button"
          onClick={() => setQuickOpen((current) => !current)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Plus size={14} />
          Quick row
        </button>
      </div>

      {filtersOpen && (
        <FilterBar
          value={filters}
          onChange={setFilters}
          onClear={() => setFilters({ ...EMPTY_FILTERS })}
        />
      )}

      <div className="overflow-x-auto">
        <div
          className="min-w-[1650px] origin-top-left"
          style={{ zoom: scale }}
        >
          <div
            className={`grid ${GRID} items-center border-b border-[#2f6655] bg-[#356b5a] px-4 py-3.5 text-[12px] font-semibold text-white`}
          >
            <div className="text-center">T/r</div>
            <div>Full name</div>
            <div>Phone</div>
            <div>Email</div>
            <div>Telegram</div>
            <div>Location</div>
            <div className="text-center">Experience</div>
            <div>English</div>
            <div>Russian</div>
            <div>Uzbek</div>
            <div>Status</div>
            <div />
          </div>

          {quickOpen && (
            <div
              className={`grid ${GRID} items-center border-b border-emerald-200 bg-emerald-50/50 px-4 py-2 dark:border-emerald-900/50 dark:bg-emerald-950/10`}
            >
              <div className="text-center text-xs font-medium text-emerald-600">
                NEW
              </div>

              <QuickInput
                value={quick.fullName}
                placeholder="Full name *"
                onChange={(value) => setQuick({ ...quick, fullName: value })}
              />
              <QuickInput
                value={quick.phone}
                placeholder="Phone"
                onChange={(value) => setQuick({ ...quick, phone: value })}
              />
              <QuickInput
                value={quick.email}
                placeholder="Email"
                onChange={(value) => setQuick({ ...quick, email: value })}
              />
              <QuickInput
                value={quick.telegram}
                placeholder="Telegram"
                onChange={(value) => setQuick({ ...quick, telegram: value })}
              />
              <QuickInput
                value={quick.location}
                placeholder="Location"
                onChange={(value) => setQuick({ ...quick, location: value })}
              />
              <QuickInput
                type="number"
                value={quick.experienceYears}
                placeholder="Years"
                onChange={(value) =>
                  setQuick({ ...quick, experienceYears: value })
                }
              />
              <QuickLanguageSelect
                value={quick.englishLevel}
                onChange={(value) =>
                  setQuick({ ...quick, englishLevel: value })
                }
              />
              <QuickLanguageSelect
                value={quick.russianLevel}
                onChange={(value) =>
                  setQuick({ ...quick, russianLevel: value })
                }
              />
              <QuickLanguageSelect
                value={quick.uzbekLevel}
                onChange={(value) => setQuick({ ...quick, uzbekLevel: value })}
              />
              <QuickStatusSelect
                value={quick.status}
                onChange={(value) => setQuick({ ...quick, status: value })}
              />

              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => void saveQuickTalent()}
                  disabled={quickSaving}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  title="Save"
                >
                  <Check size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuick({ ...EMPTY_QUICK });
                    setQuickOpen(false);
                  }}
                  disabled={quickSaving}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 dark:hover:bg-slate-800"
                  title="Cancel"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          {filteredTalents.map((talent, index) => (
            <div
              key={talent.id}
              className={[
                `grid ${GRID} items-stretch px-4 text-sm transition-colors`,
                index % 2 === 0
                  ? 'bg-white dark:bg-slate-900'
                  : 'bg-slate-50/70 dark:bg-slate-950/40',
                'hover:bg-emerald-50/30 dark:hover:bg-emerald-950/15',
                index !== filteredTalents.length - 1
                  ? 'border-b border-slate-100 dark:border-slate-800'
                  : '',
              ].join(' ')}
            >
              <div className="flex min-h-14 items-center justify-center text-[13px] font-medium text-slate-400 dark:text-slate-500">
                {index + 1}
              </div>

              <EditableText
                value={talent.fullName}
                required
                bold
                onSave={(value) =>
                  updateTalent(talent.id, { fullName: value })
                }
              />
              <EditableText
                value={talent.phone || ''}
                onSave={(value) =>
                  updateTalent(talent.id, { phone: value || null })
                }
              />
              <EditableText
                value={talent.email || ''}
                onSave={(value) =>
                  updateTalent(talent.id, { email: value || null })
                }
              />
              <EditableText
                value={talent.telegram || ''}
                onSave={(value) =>
                  updateTalent(talent.id, { telegram: value || null })
                }
              />
              <EditableText
                value={talent.location || ''}
                onSave={(value) =>
                  updateTalent(talent.id, { location: value || null })
                }
              />
              <EditableNumber
                value={talent.experienceYears}
                onSave={(value) =>
                  updateTalent(talent.id, { experienceYears: value })
                }
              />

              <LanguageCell
                talent={talent}
                language="English"
                onSave={(level) => updateLanguage(talent, 'English', level)}
              />
              <LanguageCell
                talent={talent}
                language="Russian"
                onSave={(level) => updateLanguage(talent, 'Russian', level)}
              />
              <LanguageCell
                talent={talent}
                language="Uzbek"
                onSave={(level) => updateLanguage(talent, 'Uzbek', level)}
              />

              <StatusCell
                value={talent.status}
                onSave={(value) =>
                  updateTalent(talent.id, { status: value })
                }
              />

              <div className="flex min-h-14 items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => router.push(`/talents/${talent.id}`)}
                  title="Full details"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <MoreHorizontal size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(talent)}
                  title="Delete talent"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {filteredTalents.length === 0 && !quickOpen && (
            <div className="px-6 py-14 text-center text-sm text-slate-400 dark:text-slate-500">
              No matching talents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterBar({
  value,
  onChange,
  onClear,
}: {
  value: Filters;
  onChange: (value: Filters) => void;
  onClear: () => void;
}) {
  return (
    <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <FilterInput
          value={value.fullName}
          placeholder="Full name"
          onChange={(next) => onChange({ ...value, fullName: next })}
        />
        <FilterInput
          value={value.phone}
          placeholder="Phone"
          onChange={(next) => onChange({ ...value, phone: next })}
        />
        <FilterInput
          value={value.email}
          placeholder="Email"
          onChange={(next) => onChange({ ...value, email: next })}
        />
        <FilterInput
          value={value.telegram}
          placeholder="Telegram"
          onChange={(next) => onChange({ ...value, telegram: next })}
        />
        <FilterInput
          value={value.location}
          placeholder="Location"
          onChange={(next) => onChange({ ...value, location: next })}
        />
        <FilterInput
          value={value.language}
          placeholder="Language / level"
          onChange={(next) => onChange({ ...value, language: next })}
        />
        <div className="flex gap-2">
          <FilterSelect
            value={value.status}
            options={[{ value: '', label: 'Status: All' }, ...STATUS_OPTIONS]}
            onChange={(next) => onChange({ ...value, status: next })}
          />
          <button
            type="button"
            onClick={onClear}
            className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function ZoomControl({
  scale,
  onChange,
}: {
  scale: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
      <button
        type="button"
        onClick={() =>
          onChange(Math.max(0.6, Number((scale - 0.1).toFixed(1))))
        }
        disabled={scale <= 0.6}
        className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Minus size={13} />
      </button>
      <button
        type="button"
        onClick={() => onChange(0.9)}
        className="flex h-8 min-w-[52px] items-center justify-center border-x border-slate-200 px-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
        title="Reset to 90%"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        type="button"
        onClick={() =>
          onChange(Math.min(1, Number((scale + 0.1).toFixed(1))))
        }
        disabled={scale >= 1}
        className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

function FilterInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    />
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-xs text-slate-700 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function QuickInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="px-1">
      <input
        type={type}
        min={type === 'number' ? 0 : undefined}
        max={type === 'number' ? 100 : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />
    </div>
  );
}

function QuickLanguageSelect({
  value,
  onChange,
}: {
  value: '' | LanguageLevel;
  onChange: (value: '' | LanguageLevel) => void;
}) {
  return (
    <SelectShell>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value as '' | LanguageLevel)
        }
        className="h-8 w-full appearance-none bg-transparent px-2 pr-7 text-xs text-slate-700 outline-none dark:text-slate-200"
      >
        <option value="">—</option>
        {LEVEL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </SelectShell>
  );
}

function QuickStatusSelect({
  value,
  onChange,
}: {
  value: TalentStatus;
  onChange: (value: TalentStatus) => void;
}) {
  return (
    <SelectShell>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TalentStatus)}
        className="h-8 w-full appearance-none bg-transparent px-2 pr-7 text-xs text-slate-700 outline-none dark:text-slate-200"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </SelectShell>
  );
}

function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-1 rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
      {children}
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function EditableText({
  value,
  onSave,
  required = false,
  bold = false,
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
  required?: boolean;
  bold?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  async function save() {
    const clean = draft.trim();
    if (required && !clean) {
      setDraft(value);
      setEditing(false);
      return;
    }
    if (clean === value) {
      setEditing(false);
      return;
    }

    try {
      await onSave(clean);
      setEditing(false);
    } catch {
      setDraft(value);
    }
  }

  if (editing) {
    return (
      <div className="flex min-h-14 items-center px-1">
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void save()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') {
              setDraft(value);
              setEditing(false);
            }
          }}
          className="h-8 w-full rounded-md border border-emerald-500 bg-white px-2 text-sm text-slate-900 outline-none ring-2 ring-emerald-500/10 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      title="Double-click to edit"
      className={[
        'min-h-14 min-w-0 px-2 text-left outline-none transition hover:bg-emerald-100/40 dark:hover:bg-emerald-950/20',
        bold
          ? 'font-semibold text-slate-900 dark:text-slate-100'
          : 'text-sm text-slate-600 dark:text-slate-300',
      ].join(' ')}
    >
      <span className="block truncate">{value || '—'}</span>
    </button>
  );
}

function EditableNumber({
  value,
  onSave,
}: {
  value: number | null | undefined;
  onSave: (value: number | null) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    value === null || value === undefined ? '' : String(value),
  );

  async function save() {
    const clean = draft.trim();
    const next = clean ? Number(clean) : null;
    if (clean && (!Number.isInteger(next) || Number(next) < 0)) {
      setDraft(value === null || value === undefined ? '' : String(value));
      setEditing(false);
      return;
    }

    try {
      await onSave(next);
      setEditing(false);
    } catch {
      setDraft(value === null || value === undefined ? '' : String(value));
    }
  }

  if (editing) {
    return (
      <div className="flex min-h-14 items-center px-1">
        <input
          autoFocus
          type="number"
          min={0}
          max={100}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => void save()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
          className="h-8 w-full rounded-md border border-emerald-500 bg-white px-2 text-center text-sm outline-none dark:bg-slate-950"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={() => {
        setDraft(value === null || value === undefined ? '' : String(value));
        setEditing(true);
      }}
      className="min-h-14 px-2 text-center text-sm text-slate-600 transition hover:bg-emerald-100/40 dark:text-slate-300 dark:hover:bg-emerald-950/20"
    >
      {value ?? '—'}
    </button>
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
    <div className="relative flex min-h-14 items-center px-1">
      <select
        value={current?.level || ''}
        onChange={(event) => void onSave(event.target.value)}
        className="h-8 w-full appearance-none rounded-md border border-transparent bg-transparent px-2 pr-7 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-200 hover:bg-white focus:border-emerald-500 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-950"
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
    <div className="relative flex min-h-14 items-center px-1">
      <select
        value={value}
        onChange={(event) =>
          void onSave(event.target.value as TalentStatus)
        }
        className={[
          'h-8 w-full appearance-none rounded-full border px-3 pr-7 text-[10px] font-semibold outline-none',
          value === 'AVAILABLE'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : value === 'OPEN_TO_OFFERS'
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : value === 'EMPLOYED'
                ? 'border-slate-200 bg-slate-100 text-slate-700'
                : 'border-red-200 bg-red-50 text-red-700',
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
