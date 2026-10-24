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

import {
  useMemo,
  useState,
} from 'react';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

export type Resident = {
  id: string;
  companyName: string;
  tin?: string | null;
  activity?: string | null;
  exporter: boolean;
  founderCountry?: string | null;
  region?: string | null;
  district?: string | null;
  residentSince?: string | null;
  focalPoint?: string | null;
  broughtBy?: string | null;
  status: string;
  notes?: string | null;
  quarterReports?: {
    year: number;
    quarter: number;
    status: string;
  }[];
};

type QuickResident = {
  companyName: string;
  tin: string;
  activity: string;
  exporter: boolean;
  founderCountry: string;
  district: string;
  residentSince: string;
  focalPoint: string;
  status: string;
};

type Filters = {
  companyName: string;
  tin: string;
  activity: string;
  exporter: 'ALL' | 'YES' | 'NO';
  founderCountry: string;
  district: string;
  focalPoint: string;
  status: string;
};

const emptyQuickResident:
  QuickResident = {
  companyName: '',
  tin: '',
  activity: '',
  exporter: false,
  founderCountry: '',
  district: '',
  residentSince: '',
  focalPoint: '',
  status: 'ACTIVE',
};

const emptyFilters:
  Filters = {
  companyName: '',
  tin: '',
  activity: '',
  exporter: 'ALL',
  founderCountry: '',
  district: '',
  focalPoint: '',
  status: '',
};

const statusOptions = [
  {
    value: 'ACTIVE',
    label: 'FAOL',
  },
  {
    value: 'INACTIVE',
    label: 'NOFAOL',
  },
  {
    value: 'SUSPENDED',
    label: "TO'XTATILGAN",
  },
  {
    value: 'ARCHIVED',
    label: 'FAOL EMAS',
  },
];

const grid =
  'grid-cols-[64px_2.1fr_1fr_1.3fr_0.8fr_1.3fr_1.2fr_1.25fr_1.5fr_1fr_84px]';

export default function ResidentTable({
  residents,
  onEdit,
  onDelete,
  onChanged,
  onError,
}: {
  residents: Resident[];

  onEdit: (
    resident: Resident,
  ) => void;

  onDelete: (
    resident: Resident,
  ) => void;

  onChanged:
    () => Promise<void>;

  onError: (
    message: string,
  ) => void;
}) {
  const [
    quickOpen,
    setQuickOpen,
  ] =
    useState(false);

  const [
    quickSaving,
    setQuickSaving,
  ] =
    useState(false);

  const [
    quick,
    setQuick,
  ] =
    useState<QuickResident>({
      ...emptyQuickResident,
    });

  const [
    scale,
    setScale,
  ] =
    useState(
      0.9,
    );

  const [
    filtersOpen,
    setFiltersOpen,
  ] =
    useState(false);

  const [
    filters,
    setFilters,
  ] =
    useState<Filters>({
      ...emptyFilters,
    });

  const filteredResidents =
    useMemo(() => {
      const includes = (
        value:
          | string
          | null
          | undefined,

        query:
          string,
      ) =>
        !query.trim() ||
        String(
          value ||
            '',
        )
          .toLowerCase()
          .includes(
            query
              .trim()
              .toLowerCase(),
          );

      return residents.filter(
        (
          resident,
        ) => {
          if (
            !includes(
              resident.companyName,
              filters.companyName,
            )
          ) {
            return false;
          }

          if (
            !includes(
              resident.tin,
              filters.tin,
            )
          ) {
            return false;
          }

          if (
            !includes(
              resident.activity,
              filters.activity,
            )
          ) {
            return false;
          }

          if (
            filters.exporter ===
              'YES' &&
            !resident.exporter
          ) {
            return false;
          }

          if (
            filters.exporter ===
              'NO' &&
            resident.exporter
          ) {
            return false;
          }

          if (
            !includes(
              resident.founderCountry,
              filters.founderCountry,
            )
          ) {
            return false;
          }

          if (
            !includes(
              resident.district ||
                resident.region,
              filters.district,
            )
          ) {
            return false;
          }

          if (
            !includes(
              resident.focalPoint,
              filters.focalPoint,
            )
          ) {
            return false;
          }

          if (
            filters.status &&
            resident.status !==
              filters.status
          ) {
            return false;
          }

          return true;
        },
      );
    }, [
      residents,
      filters,
    ]);

  const activeFilterCount =
    Object.entries(
      filters,
    ).filter(
      ([
        key,
        value,
      ]) =>
        key ===
        'exporter'
          ? value !==
            'ALL'
          : Boolean(
              String(
                value,
              ).trim(),
            ),
    ).length;

  async function updateResident(
    residentId: string,
    patch: Record<
      string,
      unknown
    >,
  ) {
    try {
      onError('');

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
      const message =
        error instanceof
        ApiError
          ? error.message
          : 'Unable to update resident';

      onError(
        message,
      );

      throw error;
    }
  }

  async function saveQuickResident() {
    const companyName =
      quick.companyName.trim();

    if (!companyName) {
      onError(
        'Company name is required.',
      );

      return;
    }

    try {
      setQuickSaving(
        true,
      );

      onError('');

      await apiFetch(
        '/residents',
        {
          method:
            'POST',

          body:
            JSON.stringify({
              companyName,

              tin:
                quick.tin.trim() ||
                undefined,

              activity:
                quick.activity.trim() ||
                undefined,

              exporter:
                quick.exporter,

              founderCountry:
                quick.founderCountry.trim() ||
                undefined,

              district:
                quick.district.trim() ||
                undefined,

              residentSince:
                quick.residentSince ||
                undefined,

              focalPoint:
                quick.focalPoint.trim() ||
                undefined,

              status:
                quick.status,
            }),
        },
      );

      setQuick({
        ...emptyQuickResident,
      });

      setQuickOpen(
        false,
      );

      await onChanged();
    } catch (error) {
      onError(
        error instanceof
        ApiError
          ? error.message
          : 'Unable to create resident',
      );
    } finally {
      setQuickSaving(
        false,
      );
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setFiltersOpen(
                (
                  current,
                ) =>
                  !current,
              )
            }
            className={[
              'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition',

              filtersOpen ||
              activeFilterCount >
                0
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
            ].join(
              ' ',
            )}
          >
            <Filter
              size={13}
            />

            Filter

            {activeFilterCount >
              0 && (
              <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                {
                  activeFilterCount
                }
              </span>
            )}
          </button>

          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() =>
                setScale(
                  (
                    current,
                  ) =>
                    Math.max(
                      0.6,
                      Number(
                        (
                          current -
                          0.1
                        ).toFixed(
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
              className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Minus
                size={13}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setScale(
                  0.9,
                )
              }
              className="flex h-8 min-w-[52px] items-center justify-center border-x border-slate-200 px-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
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
                  (
                    current,
                  ) =>
                    Math.min(
                      1,
                      Number(
                        (
                          current +
                          0.1
                        ).toFixed(
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
              className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Plus
                size={13}
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setQuickOpen(
              (
                current,
              ) =>
                !current,
            )
          }
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Plus
            size={14}
          />

          Quick row
        </button>
      </div>

      {filtersOpen && (
        <FilterBar
          value={
            filters
          }
          onChange={
            setFilters
          }
          onClear={() =>
            setFilters({
              ...emptyFilters,
            })
          }
        />
      )}

      <div className="overflow-x-auto">
        <div
          className="min-w-[1450px] origin-top-left"
          style={{
            zoom:
              scale,
          }}
        >
          <div
            className={`grid ${grid} items-center border-b border-[#2f6655] bg-[#356b5a] px-4 py-3.5 text-[12px] font-semibold text-white`}
          >
            <div className="text-center">T/r</div>
            <div>Nomi</div>
            <div>STIR</div>
            <div>Faoliyat turi</div>
            <div className="text-center">Eksportyor</div>
            <div>Ta&apos;sischi davlat</div>
            <div>Hudud</div>
            <div>Rezident bo&apos;lgan sana</div>
            <div>FOCAL POINT</div>
            <div>Holati</div>
            <div />
          </div>

          {quickOpen && (
            <div
              className={`grid ${grid} items-center border-b border-emerald-200 bg-emerald-50/50 px-4 py-2 dark:border-emerald-900/50 dark:bg-emerald-950/10`}
            >
              <div className="text-center text-xs font-medium text-emerald-600">
                NEW
              </div>

              <QuickInput
                value={
                  quick.companyName
                }
                placeholder="Company name *"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    companyName:
                      value,
                  })
                }
              />

              <QuickInput
                value={
                  quick.tin
                }
                placeholder="STIR"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    tin:
                      value,
                  })
                }
              />

              <QuickInput
                value={
                  quick.activity
                }
                placeholder="Activity"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    activity:
                      value,
                  })
                }
              />

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setQuick({
                      ...quick,
                      exporter:
                        !quick.exporter,
                    })
                  }
                  className={[
                    'flex h-7 w-7 items-center justify-center rounded-md border transition',

                    quick.exporter
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white text-transparent dark:border-slate-700 dark:bg-slate-950',
                  ].join(
                    ' ',
                  )}
                >
                  <Check
                    size={14}
                  />
                </button>
              </div>

              <QuickInput
                value={
                  quick.founderCountry
                }
                placeholder="Country"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    founderCountry:
                      value,
                  })
                }
              />

              <QuickInput
                value={
                  quick.district
                }
                placeholder="Hudud"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    district:
                      value,
                  })
                }
              />

              <FlexibleDateInput
                value={
                  quick.residentSince
                }
                placeholder="YYYY-MM-DD"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    residentSince:
                      value,
                  })
                }
              />

              <QuickInput
                value={
                  quick.focalPoint
                }
                placeholder="Focal point"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    focalPoint:
                      value,
                  })
                }
              />

              <SelectCell
                value={
                  quick.status
                }
                options={
                  statusOptions
                }
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    status:
                      value,
                  })
                }
              />

              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() =>
                    void saveQuickResident()
                  }
                  disabled={
                    quickSaving
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white disabled:opacity-50"
                >
                  <Check
                    size={15}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuick({
                      ...emptyQuickResident,
                    });

                    setQuickOpen(
                      false,
                    );
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-800"
                >
                  <X
                    size={15}
                  />
                </button>
              </div>
            </div>
          )}

          {filteredResidents.map(
            (
              resident,
              index,
            ) => (
              <div
                key={
                  resident.id
                }
                className={[
                  `grid ${grid} items-stretch px-4 text-sm`,

                  index %
                    2 ===
                  0
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50/70 dark:bg-slate-950/40',

                  index !==
                  filteredResidents.length -
                    1
                    ? 'border-b border-slate-100 dark:border-slate-800'
                    : '',
                ].join(
                  ' ',
                )}
              >
                <div className="flex min-h-14 items-center justify-center text-[13px] font-medium text-slate-400">
                  {index +
                    1}
                </div>

                <EditableText
                  value={
                    resident.companyName
                  }
                  bold
                  onSave={(
                    value,
                  ) =>
                    updateResident(
                      resident.id,
                      {
                        companyName:
                          value,
                      },
                    )
                  }
                />

                <EditableText
                  value={
                    resident.tin ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    updateResident(
                      resident.id,
                      {
                        tin:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <EditableText
                  value={
                    resident.activity ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    updateResident(
                      resident.id,
                      {
                        activity:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <BooleanCell
                  value={
                    resident.exporter
                  }
                  onSave={(
                    value,
                  ) =>
                    updateResident(
                      resident.id,
                      {
                        exporter:
                          value,
                      },
                    )
                  }
                />

                <EditableText
                  value={
                    resident.founderCountry ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    updateResident(
                      resident.id,
                      {
                        founderCountry:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <EditableText
                  value={
                    resident.district ||
                    resident.region ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    updateResident(
                      resident.id,
                      {
                        district:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <EditableDate
                  value={
                    resident.residentSince ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    updateResident(
                      resident.id,
                      {
                        residentSince:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <EditableText
                  value={
                    resident.focalPoint ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    updateResident(
                      resident.id,
                      {
                        focalPoint:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <EditableStatus
                  value={
                    resident.status
                  }
                  options={
                    statusOptions
                  }
                  onSave={(
                    value,
                  ) =>
                    updateResident(
                      resident.id,
                      {
                        status:
                          value,
                      },
                    )
                  }
                />

                <div className="flex min-h-14 items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onEdit(
                        resident,
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  >
                    <MoreHorizontal
                      size={15}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onDelete(
                        resident,
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  >
                    <Trash2
                      size={14}
                    />
                  </button>
                </div>
              </div>
            ),
          )}

          {filteredResidents.length ===
            0 &&
            !quickOpen && (
              <div className="px-6 py-14 text-center text-sm text-slate-400">
                No matching residents.
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
  value:
    Filters;

  onChange: (
    value:
      Filters,
  ) => void;

  onClear:
    () => void;
}) {
  return (
    <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <FilterInput
          value={
            value.companyName
          }
          placeholder="Nomi"
          onChange={(
            next,
          ) =>
            onChange({
              ...value,
              companyName:
                next,
            })
          }
        />

        <FilterInput
          value={
            value.tin
          }
          placeholder="STIR"
          onChange={(
            next,
          ) =>
            onChange({
              ...value,
              tin:
                next,
            })
          }
        />

        <FilterInput
          value={
            value.activity
          }
          placeholder="Faoliyat"
          onChange={(
            next,
          ) =>
            onChange({
              ...value,
              activity:
                next,
            })
          }
        />

        <FilterSelect
          value={
            value.exporter
          }
          options={[
            {
              value:
                'ALL',
              label:
                'Eksportyor: All',
            },
            {
              value:
                'YES',
              label:
                'Eksportyor: Yes',
            },
            {
              value:
                'NO',
              label:
                'Eksportyor: No',
            },
          ]}
          onChange={(
            next,
          ) =>
            onChange({
              ...value,
              exporter:
                next as
                  | 'ALL'
                  | 'YES'
                  | 'NO',
            })
          }
        />

        <FilterInput
          value={
            value.founderCountry
          }
          placeholder="Davlat"
          onChange={(
            next,
          ) =>
            onChange({
              ...value,
              founderCountry:
                next,
            })
          }
        />

        <FilterInput
          value={
            value.district
          }
          placeholder="Hudud"
          onChange={(
            next,
          ) =>
            onChange({
              ...value,
              district:
                next,
            })
          }
        />

        <FilterInput
          value={
            value.focalPoint
          }
          placeholder="Focal point"
          onChange={(
            next,
          ) =>
            onChange({
              ...value,
              focalPoint:
                next,
            })
          }
        />

        <div className="flex gap-2">
          <FilterSelect
            value={
              value.status
            }
            options={[
              {
                value:
                  '',
                label:
                  'Holati: All',
              },
              ...statusOptions,
            ]}
            onChange={(
              next,
            ) =>
              onChange({
                ...value,
                status:
                  next,
              })
            }
          />

          <button
            type="button"
            onClick={
              onClear
            }
            className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
      </div>
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
  onChange: (
    value:
      string,
  ) => void;
}) {
  return (
    <input
      value={
        value
      }
      placeholder={
        placeholder
      }
      onChange={(
        event,
      ) =>
        onChange(
          event.target
            .value,
        )
      }
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
  options: {
    value: string;
    label: string;
  }[];
  onChange: (
    value:
      string,
  ) => void;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <select
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value,
          )
        }
        className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-xs text-slate-700 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="px-1">
      <input
        type={
          type
        }
        value={
          value
        }
        placeholder={
          placeholder
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value,
          )
        }
        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />
    </div>
  );
}

function SelectCell({
  value,
  options,
  onChange,
}: {
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div className="relative px-1">
      <select
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value,
          )
        }
        className="h-8 w-full appearance-none rounded-md border border-slate-200 bg-white px-2 pr-7 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
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
        size={12}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function EditableText({
  value,
  onSave,
  bold = false,
}: {
  value: string;
  onSave: (
    value: string,
  ) => Promise<void>;
  bold?: boolean;
}) {
  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    draft,
    setDraft,
  ] =
    useState(
      value,
    );

  async function save() {
    const next =
      draft.trim();

    if (
      next ===
      value
    ) {
      setEditing(
        false,
      );

      return;
    }

    try {
      await onSave(
        next,
      );

      setEditing(
        false,
      );
    } catch {
      setDraft(
        value,
      );
    }
  }

  if (editing) {
    return (
      <div className="flex min-h-14 items-center px-1">
        <input
          autoFocus
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

            if (
              event.key ===
              'Escape'
            ) {
              setDraft(
                value,
              );

              setEditing(
                false,
              );
            }
          }}
          className="h-8 w-full rounded-md border border-emerald-500 bg-white px-2 text-sm outline-none dark:bg-slate-950"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={() => {
        setDraft(
          value,
        );

        setEditing(
          true,
        );
      }}
      className={[
        'min-h-14 min-w-0 px-2 text-left text-sm text-slate-600 transition hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-emerald-950/20',

        bold
          ? 'font-medium text-slate-900 dark:text-slate-100'
          : '',
      ].join(
        ' ',
      )}
    >
      <span className="block truncate">
        {value ||
          '—'}
      </span>
    </button>
  );
}

function BooleanCell({
  value,
  onSave,
}: {
  value: boolean;
  onSave: (
    value: boolean,
  ) => Promise<void>;
}) {
  return (
    <button
      type="button"
      onDoubleClick={() =>
        void onSave(
          !value,
        )
      }
      className="flex min-h-14 items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
    >
      {value ? (
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          1
        </span>
      ) : (
        <span className="text-slate-300">
          —
        </span>
      )}
    </button>
  );
}

function EditableDate({
  value,
  onSave,
}: {
  value: string;

  onSave: (
    value: string,
  ) => Promise<void>;
}) {
  const [
    draft,
    setDraft,
  ] =
    useState(
      value
        ? value.slice(
            0,
            10,
          )
        : '',
    );

  async function commit() {
    const normalized =
      normalizeDateInput(
        draft,
      );

    if (
      normalized ===
      null
    ) {
      setDraft(
        value
          ? value.slice(
              0,
              10,
            )
          : '',
      );

      return;
    }

    const original =
      value
        ? value.slice(
            0,
            10,
          )
        : '';

    setDraft(
      normalized,
    );

    if (
      normalized ===
      original
    ) {
      return;
    }

    await onSave(
      normalized,
    );
  }

  return (
    <div className="flex min-h-14 items-center px-1">
      <input
        type="text"
        inputMode="numeric"
        value={
          draft
        }
        placeholder="YYYY-MM-DD"
        onChange={(
          event,
        ) =>
          setDraft(
            event.target
              .value,
          )
        }
        onPaste={(
          event,
        ) => {
          const pasted =
            event.clipboardData.getData(
              'text',
            );

          const normalized =
            normalizeDateInput(
              pasted,
            );

          if (
            normalized !==
            null
          ) {
            event.preventDefault();

            setDraft(
              normalized,
            );

            void onSave(
              normalized,
            );
          }
        }}
        onBlur={() =>
          void commit()
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

          if (
            event.key ===
            'Escape'
          ) {
            setDraft(
              value
                ? value.slice(
                    0,
                    10,
                  )
                : '',
            );

            event.currentTarget.blur();
          }
        }}
        className="h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-center text-xs font-medium text-slate-600 outline-none transition hover:border-slate-200 focus:border-emerald-500 focus:bg-white dark:text-slate-300 dark:focus:bg-slate-950"
      />
    </div>
  );
}

function FlexibleDateInput({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
}: {
  value: string;

  onChange: (
    value: string,
  ) => void;

  placeholder?: string;
}) {
  const [
    draft,
    setDraft,
  ] =
    useState(
      value,
    );

  function commit() {
    const normalized =
      normalizeDateInput(
        draft,
      );

    if (
      normalized ===
      null
    ) {
      setDraft(
        value,
      );

      return;
    }

    setDraft(
      normalized,
    );

    onChange(
      normalized,
    );
  }

  return (
    <div className="px-1">
      <input
        type="text"
        inputMode="numeric"
        value={
          draft
        }
        placeholder={
          placeholder
        }
        onChange={(
          event,
        ) =>
          setDraft(
            event.target
              .value,
          )
        }
        onPaste={(
          event,
        ) => {
          const pasted =
            event.clipboardData.getData(
              'text',
            );

          const normalized =
            normalizeDateInput(
              pasted,
            );

          if (
            normalized !==
            null
          ) {
            event.preventDefault();

            setDraft(
              normalized,
            );

            onChange(
              normalized,
            );
          }
        }}
        onBlur={
          commit
        }
        onKeyDown={(
          event,
        ) => {
          if (
            event.key ===
            'Enter'
          ) {
            commit();

            event.currentTarget.blur();
          }

          if (
            event.key ===
            'Escape'
          ) {
            setDraft(
              value,
            );

            event.currentTarget.blur();
          }
        }}
        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-center text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />
    </div>
  );
}

function normalizeDateInput(
  value: string,
) {
  const clean =
    value.trim();

  if (!clean) {
    return '';
  }

  const iso =
    clean.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    );

  if (iso) {
    const [
      ,
      year,
      month,
      day,
    ] = iso;

    const normalized =
      `${year}-${month.padStart(
        2,
        '0',
      )}-${day.padStart(
        2,
        '0',
      )}`;

    return isValidDateValue(
      normalized,
    )
      ? normalized
      : null;
  }

  const european =
    clean.match(
      /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/,
    );

  if (european) {
    const [
      ,
      day,
      month,
      year,
    ] = european;

    const normalized =
      `${year}-${month.padStart(
        2,
        '0',
      )}-${day.padStart(
        2,
        '0',
      )}`;

    return isValidDateValue(
      normalized,
    )
      ? normalized
      : null;
  }

  return null;
}

function isValidDateValue(
  value: string,
) {
  const [
    year,
    month,
    day,
  ] =
    value
      .split(
        '-',
      )
      .map(
        Number,
      );

  const date =
    new Date(
      year,
      month -
        1,
      day,
    );

  return (
    date.getFullYear() ===
      year &&
    date.getMonth() ===
      month -
        1 &&
    date.getDate() ===
      day
  );
}

function EditableStatus({
  value,
  options,
  onSave,
}: {
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onSave: (
    value: string,
  ) => Promise<void>;
}) {
  const [
    editing,
    setEditing,
  ] =
    useState(false);

  if (editing) {
    return (
      <SelectCell
        value={
          value
        }
        options={
          options
        }
        onChange={(
          next,
        ) => {
          setEditing(
            false,
          );

          void onSave(
            next,
          );
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={() =>
        setEditing(
          true,
        )
      }
      className="flex min-h-14 items-center px-2"
    >
      <span
        className={[
          'inline-flex min-w-[90px] justify-center rounded-full px-3 py-1 text-[10px] font-semibold',

          value ===
          'ACTIVE'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-red-100 text-red-700',
        ].join(
          ' ',
        )}
      >
        {options.find(
          (
            option,
          ) =>
            option.value ===
            value,
        )?.label ||
          value}
      </span>
    </button>
  );
}
