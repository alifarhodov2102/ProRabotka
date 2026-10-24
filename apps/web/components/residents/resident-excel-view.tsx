'use client';

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Save,
  X,
} from 'lucide-react';

import {
  useEffect,
  useRef,
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
      0.7,
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
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Excel view
          </p>

          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Edit resident data directly in the table.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {savingId && (
            <div className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:flex">
              <Save
                size={
                  13
                }
              />

              Saving...
            </div>
          )}

          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
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
                  0.7,
                )
              }
              className="flex h-8 min-w-[54px] items-center justify-center border-x border-slate-200 px-2 text-xs font-semibold tabular-nums text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Reset to 70%"
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
            <div className="col-span-10 flex h-12 items-center justify-center border-b border-slate-300 bg-white px-4 font-serif text-[18px] font-bold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              Sirdaryo viloyati IT-Park rezidentlari
            </div>
          </div>

          <div className="sticky top-0 z-20 grid grid-cols-[72px_360px_130px_220px_110px_190px_190px_190px_250px_150px] bg-[#356b5a] text-[12px] font-bold text-white shadow-sm">
            {[
              'T/r',
              'Nomi',
              'STIR',
              'Faoliyat turi',
              'Eksportyor',
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
            <div className="px-6 py-16 text-center text-sm font-medium text-slate-400">
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
        'grid grid-cols-[72px_360px_130px_220px_110px_190px_190px_190px_250px_150px] text-[13px] font-semibold text-slate-900 dark:text-slate-100',

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
        strong
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
    <div className="flex min-h-14 items-center justify-center border-b border-r border-slate-300 px-2 font-semibold dark:border-slate-700">
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
  strong = false,
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

  strong?:
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
          className="min-h-14 w-full resize-none bg-transparent px-2.5 py-2 text-center text-[13px] font-semibold leading-5 outline-none transition duration-150 hover:bg-slate-50 focus:bg-emerald-50/70 focus:ring-2 focus:ring-inset focus:ring-emerald-300/60 dark:hover:bg-slate-900/60 dark:focus:bg-emerald-950/25 dark:focus:ring-emerald-900"
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
            'h-14 w-full bg-transparent px-2.5 text-center text-[13px] font-semibold outline-none transition duration-150 hover:bg-slate-50 focus:bg-emerald-50/70 focus:ring-2 focus:ring-inset focus:ring-emerald-300/60 dark:hover:bg-slate-900/60 dark:focus:bg-emerald-950/25 dark:focus:ring-emerald-900',

            mono
              ? 'font-mono'
              : '',

            strong
              ? 'font-semibold'
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
        className="h-14 w-full bg-transparent px-2.5 text-center text-[13px] font-semibold text-slate-900 outline-none transition duration-150 focus:bg-white/40 focus:ring-2 focus:ring-inset focus:ring-slate-500/20"
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
          'flex h-7 w-7 items-center justify-center rounded-md border transition duration-150 active:scale-95',

          value
            ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
            : 'border-slate-300 bg-white text-transparent hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900',
        ].join(
          ' ',
        )}
      >
        <Check
          size={
            15
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
  const [
    open,
    setOpen,
  ] =
    useState(false);

  const wrapperRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const dateValue =
    value
      ? value.slice(
          0,
          10,
        )
      : '';

  const selectedDate =
    dateValue
      ? new Date(
          `${dateValue}T00:00:00`,
        )
      : null;

  const [
    visibleMonth,
    setVisibleMonth,
  ] =
    useState(() => {
      const base =
        selectedDate ??
        new Date();

      return new Date(
        base.getFullYear(),
        base.getMonth(),
        1,
      );
    });

  useEffect(() => {
    if (
      selectedDate
    ) {
      setVisibleMonth(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1,
        ),
      );
    }
  }, [
    dateValue,
  ]);

  useEffect(() => {
    function handleOutsideClick(
      event:
        MouseEvent |
        TouchEvent,
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(
          false,
        );
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    );

    document.addEventListener(
      'touchstart',
      handleOutsideClick,
      {
        passive:
          true,
      },
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      );

      document.removeEventListener(
        'touchstart',
        handleOutsideClick,
      );
    };
  }, []);

  const formatted =
    selectedDate
      ? selectedDate.toLocaleDateString(
          'en-GB',
          {
            day:
              '2-digit',

            month:
              '2-digit',

            year:
              'numeric',
          },
        )
      : 'Set date';

  const year =
    visibleMonth.getFullYear();

  const month =
    visibleMonth.getMonth();

  const firstWeekday =
    new Date(
      year,
      month,
      1,
    ).getDay();

  const mondayIndex =
    (
      firstWeekday +
      6
    ) %
    7;

  const daysInMonth =
    new Date(
      year,
      month +
        1,
      0,
    ).getDate();

  const daysInPreviousMonth =
    new Date(
      year,
      month,
      0,
    ).getDate();

  const cells:
    {
      date:
        Date;

      currentMonth:
        boolean;
    }[] = [];

  for (
    let index =
      mondayIndex -
      1;
    index >=
    0;
    index -=
    1
  ) {
    cells.push({
      date:
        new Date(
          year,
          month -
            1,
          daysInPreviousMonth -
            index,
        ),

      currentMonth:
        false,
    });
  }

  for (
    let day =
      1;
    day <=
    daysInMonth;
    day +=
    1
  ) {
    cells.push({
      date:
        new Date(
          year,
          month,
          day,
        ),

      currentMonth:
        true,
    });
  }

  let nextDay =
    1;

  while (
    cells.length <
    42
  ) {
    cells.push({
      date:
        new Date(
          year,
          month +
            1,
          nextDay,
        ),

      currentMonth:
        false,
    });

    nextDay +=
      1;
  }

  function toValue(
    date:
      Date,
  ) {
    const y =
      date.getFullYear();

    const m =
      String(
        date.getMonth() +
          1,
      ).padStart(
        2,
        '0',
      );

    const d =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      );

    return `${y}-${m}-${d}`;
  }

  async function selectDate(
    date:
      Date,
  ) {
    setOpen(
      false,
    );

    await onSave(
      toValue(
        date,
      ),
    );
  }

  async function clearDate() {
    setOpen(
      false,
    );

    await onSave(
      '',
    );
  }

  async function selectToday() {
    const today =
      new Date();

    setVisibleMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );

    await selectDate(
      today,
    );
  }

  function previousMonth() {
    setVisibleMonth(
      (
        current,
      ) =>
        new Date(
          current.getFullYear(),
          current.getMonth() -
            1,
          1,
        ),
    );
  }

  function nextMonth() {
    setVisibleMonth(
      (
        current,
      ) =>
        new Date(
          current.getFullYear(),
          current.getMonth() +
            1,
          1,
        ),
    );
  }

  const todayValue =
    toValue(
      new Date(),
    );

  return (
    <div
      ref={
        wrapperRef
      }
      className="relative flex min-h-14 items-center border-b border-r border-slate-300 px-2 dark:border-slate-700"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (
              current,
            ) =>
              !current,
          )
        }
        className={[
          'flex h-10 w-full items-center justify-center gap-2 rounded-lg px-2 text-[13px] font-semibold transition duration-150 focus:outline-none focus:ring-2',

          open
            ? 'bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300/60 dark:bg-emerald-950/30 dark:text-emerald-100 dark:ring-emerald-900'
            : 'text-slate-800 hover:bg-slate-100 focus:ring-emerald-300/60 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-emerald-900',
        ].join(
          ' ',
        )}
      >
        <span>
          {
            formatted
          }
        </span>

        <CalendarDays
          size={
            15
          }
          className="shrink-0 text-slate-400"
        />
      </button>

      {open && (
        <div className="absolute left-1/2 top-[calc(100%+8px)] z-[80] w-[300px] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3 dark:border-slate-800">
            <button
              type="button"
              onClick={
                previousMonth
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Previous month"
            >
              <ChevronLeft
                size={
                  16
                }
              />
            </button>

            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {visibleMonth.toLocaleDateString(
                'en-US',
                {
                  month:
                    'long',

                  year:
                    'numeric',
                },
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={
                  nextMonth
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                aria-label="Next month"
              >
                <ChevronRight
                  size={
                    16
                  }
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setOpen(
                    false,
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close calendar"
              >
                <X
                  size={
                    15
                  }
                />
              </button>
            </div>
          </div>

          <div className="p-3">
            <div className="mb-1 grid grid-cols-7">
              {[
                'Mo',
                'Tu',
                'We',
                'Th',
                'Fr',
                'Sa',
                'Su',
              ].map(
                (
                  label,
                ) => (
                  <div
                    key={
                      label
                    }
                    className="flex h-8 items-center justify-center text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500"
                  >
                    {
                      label
                    }
                  </div>
                ),
              )}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map(
                (
                  cell,
                ) => {
                  const cellValue =
                    toValue(
                      cell.date,
                    );

                  const selected =
                    cellValue ===
                    dateValue;

                  const today =
                    cellValue ===
                    todayValue;

                  return (
                    <button
                      key={
                        cellValue
                      }
                      type="button"
                      onClick={() =>
                        void selectDate(
                          cell.date,
                        )
                      }
                      className={[
                        'flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition active:scale-95',

                        selected
                          ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                          : today
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900'
                            : cell.currentMonth
                              ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                              : 'text-slate-300 hover:bg-slate-50 dark:text-slate-600 dark:hover:bg-slate-800/50',
                      ].join(
                        ' ',
                      )}
                    >
                      {
                        cell.date.getDate()
                      }
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2.5 dark:border-slate-800">
            <button
              type="button"
              onClick={() =>
                void clearDate()
              }
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() =>
                void selectToday()
              }
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Today
            </button>
          </div>
        </div>
      )}
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
          'h-8 w-full appearance-none rounded-full px-3 pr-8 text-center text-[10px] font-bold text-white shadow-sm outline-none transition duration-150 focus:ring-2 focus:ring-offset-1',

          active
            ? 'bg-emerald-700 focus:ring-emerald-400'
            : 'bg-red-700 focus:ring-red-400',
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
