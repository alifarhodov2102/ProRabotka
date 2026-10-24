'use client';

import {
  Check,
  ChevronDown,
  Minus,
  Plus,
  Save,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

import type {
  Resident,
} from './resident-table';

const statusOptions = [
  {
    value:
      'ACTIVE',

    label:
      'FAOL',
  },
  {
    value:
      'INACTIVE',

    label:
      'FAOL EMAS',
  },
  {
    value:
      'SUSPENDED',

    label:
      "TO'XTATILGAN",
  },
  {
    value:
      'ARCHIVED',

    label:
      'FAOL EMAS',
  },
];

export default function ResidentExcelView({
  residents,
  onChanged,
  onError,
}: {
  residents:
    Resident[];

  onChanged:
    () => Promise<void>;

  onError: (
    message: string,
  ) => void;
}) {
  const [
    savingId,
    setSavingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    scale,
    setScale,
  ] =
    useState(
      0.8,
    );

  async function patchResident(
    residentId:
      string,

    patch:
      Record<
        string,
        unknown
      >,
  ) {
    try {
      setSavingId(
        residentId,
      );

      onError(
        '',
      );

      await apiFetch(
        `/residents/${residentId}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify(
              patch,
            ),
        },
      );

      await onChanged();
    } catch (error) {
      onError(
        error instanceof
        ApiError
          ? error.message
          : 'Unable to update resident.',
      );

      throw error;
    } finally {
      setSavingId(
        null,
      );
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Excel view
          </p>

          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Edit cells directly. Changes are saved to ProRabotka.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {savingId && (
            <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
              <Save
                size={
                  13
                }
              />

              Saving...
            </div>
          )}

          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() =>
                setScale(
                  (current) =>
                    Math.max(
                      0.6,
                      Number(
                        (current -
                          0.1).toFixed(
                          1,
                        ),
                      ),
                    ),
                )
              }
              disabled={
                scale <=
                0.6
              }
              className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Zoom out"
              aria-label="Zoom out Excel view"
            >
              <Minus
                size={
                  14
                }
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setScale(
                  0.8,
                )
              }
              className="flex h-8 min-w-[54px] items-center justify-center border-x border-slate-200 px-2 text-xs font-medium tabular-nums text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Reset to 80%"
            >
              {Math.round(
                scale *
                  100,
              )}
              %
            </button>

            <button
              type="button"
              onClick={() =>
                setScale(
                  (current) =>
                    Math.min(
                      1,
                      Number(
                        (current +
                          0.1).toFixed(
                          1,
                        ),
                      ),
                    ),
                )
              }
              disabled={
                scale >=
                1
              }
              className="flex h-8 w-8 items-center justify-center text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Zoom in"
              aria-label="Zoom in Excel view"
            >
              <Plus
                size={
                  14
                }
              />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-auto">
        <div
          className="min-w-[1510px] bg-white dark:bg-slate-950"
          style={{
            zoom:
              scale,
          }}
        >
          <div className="grid grid-cols-[72px_360px_130px_220px_110px_190px_190px_190px_250px_150px] border-b border-slate-300 dark:border-slate-700">
            <div className="col-span-10 flex h-12 items-center justify-center border-b border-slate-300 bg-white px-4 font-serif text-[17px] font-bold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              Sirdaryo viloyati IT-Park rezidentlari
            </div>
          </div>

          <div className="sticky top-0 z-20 grid grid-cols-[72px_360px_130px_220px_110px_190px_190px_190px_250px_150px] bg-[#356b5a] text-[12px] font-semibold text-white shadow-sm">
            {[
              'T/r',
              'Nomi',
              'STIR',
              'Faoliyat turi',
              'Exportyor',
              "Ta'sischi davlat",
              'Hudud',
              "Rezident bo'lgan sana",
              'FOCAL POINT',
              'HOLATI',
            ].map(
              (
                header,
              ) => (
                <div
                  key={
                    header
                  }
                  className="flex min-h-12 items-center justify-center border-b border-r border-[#2b594c] px-2 text-center last:border-r-0"
                >
                  {header}
                </div>
              ),
            )}
          </div>

          {residents.length ===
          0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-400">
              No residents.
            </div>
          ) : (
            residents.map(
              (
                resident,
                index,
              ) => (
                <ExcelRow
                  key={
                    resident.id
                  }
                  index={
                    index
                  }
                  resident={
                    resident
                  }
                  saving={
                    savingId ===
                    resident.id
                  }
                  onPatch={(
                    patch,
                  ) =>
                    patchResident(
                      resident.id,
                      patch,
                    )
                  }
                />
              ),
            )
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-500">
        Tip: Tab bilan keyingi katakka o‘ting. Text kataklari focusdan chiqqanda saqlanadi.
      </div>
    </div>
  );
}

function ExcelRow({
  index,
  resident,
  saving,
  onPatch,
}: {
  index: number;

  resident:
    Resident;

  saving:
    boolean;

  onPatch: (
    patch:
      Record<
        string,
        unknown
      >,
  ) =>
    Promise<void>;
}) {
  return (
    <div
      className={[
        'grid grid-cols-[72px_360px_130px_220px_110px_190px_190px_190px_250px_150px] text-[13px] text-slate-800 dark:text-slate-200',

        index %
          2 ===
        0
          ? 'bg-white dark:bg-slate-950'
          : 'bg-slate-50/60 dark:bg-slate-900/40',

        saving
          ? 'opacity-70'
          : '',
      ].join(
        ' ',
      )}
    >
      <StaticCell>
        {index +
          1}
      </StaticCell>

      <TextCell
        value={
          resident.companyName
        }
        required
        onSave={(
          value,
        ) =>
          onPatch({
            companyName:
              value,
          })
        }
      />

      <TextCell
        value={
          resident.tin ||
          ''
        }
        mono
        onSave={(
          value,
        ) =>
          onPatch({
            tin:
              value ||
              null,
          })
        }
      />

      <TextCell
        value={
          resident.activity ||
          ''
        }
        onSave={(
          value,
        ) =>
          onPatch({
            activity:
              value ||
              null,
          })
        }
      />

      <BooleanCell
        value={
          resident.exporter
        }
        onSave={(
          value,
        ) =>
          onPatch({
            exporter:
              value,
          })
        }
      />

      <CountryCell
        value={
          resident.founderCountry ||
          ''
        }
        onSave={(
          value,
        ) =>
          onPatch({
            founderCountry:
              value ||
              null,
          })
        }
      />

      <TextCell
        value={
          resident.district ||
          resident.region ||
          ''
        }
        onSave={(
          value,
        ) =>
          onPatch({
            district:
              value ||
              null,
          })
        }
      />

      <DateCell
        value={
          resident.residentSince ||
          ''
        }
        onSave={(
          value,
        ) =>
          onPatch({
            residentSince:
              value ||
              null,
          })
        }
      />

      <TextCell
        value={
          resident.focalPoint ||
          ''
        }
        multiline
        onSave={(
          value,
        ) =>
          onPatch({
            focalPoint:
              value ||
              null,
          })
        }
      />

      <StatusCell
        value={
          resident.status
        }
        onSave={(
          value,
        ) =>
          onPatch({
            status:
              value,
          })
        }
      />
    </div>
  );
}

function StaticCell({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center justify-center border-b border-r border-slate-300 px-2 font-medium dark:border-slate-700">
      {children}
    </div>
  );
}

function TextCell({
  value,
  onSave,
  required = false,
  mono = false,
  multiline = false,
}: {
  value: string;

  onSave: (
    value: string,
  ) =>
    Promise<void>;

  required?:
    boolean;

  mono?:
    boolean;

  multiline?:
    boolean;
}) {
  const [
    draft,
    setDraft,
  ] =
    useState(
      value,
    );

  useEffect(() => {
    setDraft(
      value,
    );
  }, [value]);

  async function save() {
    const next =
      draft.trim();

    if (
      required &&
      !next
    ) {
      setDraft(
        value,
      );

      return;
    }

    if (
      next ===
      value.trim()
    ) {
      return;
    }

    try {
      await onSave(
        next,
      );
    } catch {
      setDraft(
        value,
      );
    }
  }

  return (
    <div className="flex min-h-14 items-stretch border-b border-r border-slate-300 dark:border-slate-700">
      {multiline ? (
        <textarea
          rows={
            2
          }
          value={
            draft
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
            void save()
          }
          className="min-h-14 w-full resize-none bg-transparent px-2.5 py-2 text-center text-[13px] leading-5 outline-none transition focus:bg-emerald-50/60 dark:focus:bg-emerald-950/20"
        />
      ) : (
        <input
          value={
            draft
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
            void save()
          }
          onKeyDown={(
            event,
          ) => {
            if (
              event.key ===
              'Enter'
            ) {
              event.currentTarget.blur();
            }
          }}
          className={[
            'h-14 w-full bg-transparent px-2.5 text-center text-[13px] outline-none transition focus:bg-emerald-50/60 dark:focus:bg-emerald-950/20',

            mono
              ? 'font-mono'
              : '',
          ].join(
            ' ',
          )}
        />
      )}
    </div>
  );
}

function CountryCell({
  value,
  onSave,
}: {
  value: string;

  onSave: (
    value: string,
  ) =>
    Promise<void>;
}) {
  const [
    draft,
    setDraft,
  ] =
    useState(
      value,
    );

  useEffect(() => {
    setDraft(
      value,
    );
  }, [value]);

  const normalized =
    draft
      .trim()
      .toLowerCase();

  const isUzbekistan =
    normalized.includes(
      "o'zbekiston",
    ) ||
    normalized.includes(
      'uzbekistan',
    );

  async function save() {
    const next =
      draft.trim();

    if (
      next ===
      value.trim()
    ) {
      return;
    }

    try {
      await onSave(
        next,
      );
    } catch {
      setDraft(
        value,
      );
    }
  }

  return (
    <div
      className={[
        'flex min-h-14 items-stretch border-b border-r border-slate-300 dark:border-slate-700',

        draft.trim()
          ? isUzbekistan
            ? 'bg-yellow-300 dark:bg-yellow-500/70'
            : 'bg-lime-400/80 dark:bg-lime-500/60'
          : '',
      ].join(
        ' ',
      )}
    >
      <input
        value={
          draft
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
          void save()
        }
        onKeyDown={(
          event,
        ) => {
          if (
            event.key ===
            'Enter'
          ) {
            event.currentTarget.blur();
          }
        }}
        className="h-14 w-full bg-transparent px-2.5 text-center text-[13px] font-medium text-slate-900 outline-none"
      />
    </div>
  );
}

function BooleanCell({
  value,
  onSave,
}: {
  value:
    boolean;

  onSave: (
    value:
      boolean,
  ) =>
    Promise<void>;
}) {
  return (
    <div className="flex min-h-14 items-center justify-center border-b border-r border-slate-300 dark:border-slate-700">
      <button
        type="button"
        onClick={() =>
          void onSave(
            !value,
          )
        }
        className={[
          'flex h-6 w-6 items-center justify-center rounded-md border transition',

          value
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-900',
        ].join(
          ' ',
        )}
      >
        <Check
          size={
            14
          }
        />
      </button>
    </div>
  );
}

function DateCell({
  value,
  onSave,
}: {
  value:
    string;

  onSave: (
    value:
      string,
  ) =>
    Promise<void>;
}) {
  const dateValue =
    value
      ? value.slice(
          0,
          10,
        )
      : '';

  return (
    <div className="flex min-h-14 items-center border-b border-r border-slate-300 px-2 dark:border-slate-700">
      <input
        type="date"
        value={
          dateValue
        }
        onChange={(
          event,
        ) =>
          void onSave(
            event.target
              .value,
          )
        }
        className="h-10 w-full bg-transparent text-center text-[13px] outline-none"
      />
    </div>
  );
}

function StatusCell({
  value,
  onSave,
}: {
  value:
    string;

  onSave: (
    value:
      string,
  ) =>
    Promise<void>;
}) {
  const active =
    value ===
    'ACTIVE';

  return (
    <div className="relative flex min-h-14 items-center border-b border-slate-300 px-2 dark:border-slate-700">
      <select
        value={
          value
        }
        onChange={(
          event,
        ) =>
          void onSave(
            event.target
              .value,
          )
        }
        className={[
          'h-7 w-full appearance-none rounded-full px-3 pr-7 text-center text-[10px] font-bold text-white outline-none',

          active
            ? 'bg-emerald-700'
            : 'bg-red-700',
        ].join(
          ' ',
        )}
      >
        {statusOptions.map(
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
              className="bg-white text-slate-900"
            >
              {
                option.label
              }
            </option>
          ),
        )}
      </select>

      <ChevronDown
        size={
          12
        }
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white"
      />
    </div>
  );
}
