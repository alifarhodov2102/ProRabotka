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
  useRouter,
} from 'next/navigation';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

import TalentCvCell, {
  type TalentCvDocument,
} from './talent-cv-cell';

import type {
  LanguageLevel,
  Talent,
  TalentStatus,
} from './types';

type QuickTalent = {
  fullName: string;
  phone: string;
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
  telegram: string;
  location: string;
  language: string;
  status: string;
};

const emptyQuickTalent:
  QuickTalent = {
  fullName: '',
  phone: '',
  telegram: '',
  location: '',
  experienceYears: '',
  englishLevel: '',
  russianLevel: '',
  uzbekLevel: '',
  status: 'AVAILABLE',
};

const emptyFilters:
  Filters = {
  fullName: '',
  phone: '',
  telegram: '',
  location: '',
  language: '',
  status: '',
};

const statusOptions: {
  value: TalentStatus;
  label: string;
}[] = [
  {
    value: 'AVAILABLE',
    label: 'AVAILABLE',
  },
  {
    value: 'OPEN_TO_OFFERS',
    label: 'OPEN TO OFFERS',
  },
  {
    value: 'EMPLOYED',
    label: 'EMPLOYED',
  },
  {
    value: 'NOT_AVAILABLE',
    label: 'NOT AVAILABLE',
  },
];

const languageOptions: {
  value: LanguageLevel;
  label: string;
}[] = [
  {
    value: 'BASIC',
    label: 'Basic',
  },
  {
    value: 'INTERMEDIATE',
    label: 'Intermediate',
  },
  {
    value: 'ADVANCED',
    label: 'Advanced',
  },
  {
    value: 'FLUENT',
    label: 'Fluent',
  },
  {
    value: 'NATIVE',
    label: 'Native',
  },
];

const grid =
  'grid-cols-[58px_2fr_1.25fr_1.2fr_1.2fr_0.9fr_1fr_1fr_1fr_1.25fr_1fr_1.15fr_82px]';

export default function TalentTable({
  talents,
  cvByTalentId,
  onChanged,
  onDelete,
  onError,
}: {
  talents: Talent[];

  cvByTalentId:
    Record<
      string,
      TalentCvDocument | null
    >;

  onChanged:
    () => Promise<void>;

  onDelete: (
    talent: Talent,
  ) => void;

  onError: (
    message: string,
  ) => void;
}) {
  const router =
    useRouter();

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
    useState<QuickTalent>({
      ...emptyQuickTalent,
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

  const filteredTalents =
    useMemo(() => {
      const includes = (
        value:
          | string
          | number
          | null
          | undefined,

        query:
          string,
      ) =>
        !query.trim() ||
        String(
          value ??
            '',
        )
          .toLowerCase()
          .includes(
            query
              .trim()
              .toLowerCase(),
          );

      return talents.filter(
        (
          talent,
        ) => {
          if (
            !includes(
              talent.fullName,
              filters.fullName,
            ) ||
            !includes(
              talent.phone,
              filters.phone,
            ) ||
            !includes(
              talent.telegram,
              filters.telegram,
            ) ||
            !includes(
              talent.location,
              filters.location,
            )
          ) {
            return false;
          }

          if (
            filters.status &&
            talent.status !==
              filters.status
          ) {
            return false;
          }

          if (
            filters.language
          ) {
            const q =
              filters.language
                .toLowerCase();

            if (
              !talent.languages.some(
                (
                  item,
                ) =>
                  `${item.language} ${item.level}`
                    .toLowerCase()
                    .includes(
                      q,
                    ),
              )
            ) {
              return false;
            }
          }

          return true;
        },
      );
    }, [
      talents,
      filters,
    ]);

  const activeFilterCount =
    Object.values(
      filters,
    ).filter(
      (
        value,
      ) =>
        Boolean(
          value.trim(),
        ),
    ).length;

  async function updateTalent(
    id: string,
    patch: Record<
      string,
      unknown
    >,
  ) {
    try {
      onError('');

      await apiFetch(
        `/talents/${id}`,
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
          : 'Unable to update talent.',
      );

      throw error;
    }
  }

  async function updateLanguage(
    talent: Talent,
    language: string,
    level: string,
  ) {
    const existing =
      talent.languages.find(
        (
          item,
        ) =>
          item.language
            .toLowerCase() ===
          language.toLowerCase(),
      );

    try {
      onError('');

      if (!level) {
        if (existing) {
          await apiFetch(
            `/talents/${talent.id}/languages/${existing.id}`,
            {
              method:
                'DELETE',
            },
          );
        }
      } else if (
        existing
      ) {
        await apiFetch(
          `/talents/${talent.id}/languages/${existing.id}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify({
                level,
              }),
          },
        );
      } else {
        await apiFetch(
          `/talents/${talent.id}/languages`,
          {
            method:
              'POST',

            body:
              JSON.stringify({
                language,
                level,
              }),
          },
        );
      }

      await onChanged();
    } catch (error) {
      onError(
        error instanceof
        ApiError
          ? error.message
          : 'Unable to update language.',
      );

      throw error;
    }
  }

  async function saveQuickTalent() {
    if (
      !quick.fullName.trim()
    ) {
      onError(
        'Full name is required.',
      );

      return;
    }

    try {
      setQuickSaving(
        true,
      );

      onError('');

      const talent =
        await apiFetch<Talent>(
          '/talents',
          {
            method:
              'POST',

            body:
              JSON.stringify({
                fullName:
                  quick.fullName.trim(),

                phone:
                  quick.phone.trim() ||
                  null,

                telegram:
                  quick.telegram.trim() ||
                  null,

                location:
                  quick.location.trim() ||
                  null,

                experienceYears:
                  quick.experienceYears
                    ? Number(
                        quick.experienceYears,
                      )
                    : null,

                status:
                  quick.status,
              }),
          },
        );

      const languages = [
        [
          'English',
          quick.englishLevel,
        ],
        [
          'Russian',
          quick.russianLevel,
        ],
        [
          'Uzbek',
          quick.uzbekLevel,
        ],
      ] as const;

      for (
        const [
          language,
          level,
        ] of languages
      ) {
        if (!level) {
          continue;
        }

        await apiFetch(
          `/talents/${talent.id}/languages`,
          {
            method:
              'POST',

            body:
              JSON.stringify({
                language,
                level,
              }),
          },
        );
      }

      setQuick({
        ...emptyQuickTalent,
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
          : 'Unable to create talent.',
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
              title="Reset to 90%"
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
        <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[
              [
                'fullName',
                'Full name',
              ],
              [
                'phone',
                'Phone',
              ],
              [
                'telegram',
                'Telegram',
              ],
              [
                'location',
                'Location',
              ],
              [
                'language',
                'Language / level',
              ],
            ].map(
              (
                [
                  key,
                  placeholder,
                ],
              ) => (
                <input
                  key={
                    key
                  }
                  value={
                    filters[
                      key as keyof Filters
                    ]
                  }
                  placeholder={
                    placeholder
                  }
                  onChange={(
                    event,
                  ) =>
                    setFilters({
                      ...filters,

                      [key]:
                        event.target.value,
                    })
                  }
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"
                />
              ),
            )}

            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <select
                  value={
                    filters.status
                  }
                  onChange={(
                    event,
                  ) =>
                    setFilters({
                      ...filters,
                      status:
                        event.target.value,
                    })
                  }
                  className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="">
                    Status: All
                  </option>

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

              <button
                type="button"
                onClick={() =>
                  setFilters({
                    ...emptyFilters,
                  })
                }
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div
          className="min-w-[1780px]"
          style={{
            zoom:
              scale,
          }}
        >
          <div
            className={`grid ${grid} items-center bg-[#356b5a] px-4 py-3.5 text-[12px] font-semibold text-white`}
          >
            <div className="text-center">
              T/r
            </div>

            <div>
              Full name
            </div>

            <div>
              Phone
            </div>

            <div>
              Telegram
            </div>

            <div>
              Location
            </div>

            <div className="text-center">
              Experience
            </div>

            <div>
              English
            </div>

            <div>
              Russian
            </div>

            <div>
              Uzbek
            </div>

            <div>
              Status
            </div>

            <div>
              Added
            </div>

            <div className="text-center">
              CV
            </div>

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
                  quick.fullName
                }
                placeholder="Full name *"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    fullName:
                      value,
                  })
                }
              />

              <QuickInput
                value={
                  quick.phone
                }
                placeholder="Phone"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    phone:
                      value,
                  })
                }
              />

              <QuickInput
                value={
                  quick.telegram
                }
                placeholder="Telegram"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    telegram:
                      value,
                  })
                }
              />

              <QuickInput
                value={
                  quick.location
                }
                placeholder="Location"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    location:
                      value,
                  })
                }
              />

              <QuickInput
                type="number"
                value={
                  quick.experienceYears
                }
                placeholder="Years"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    experienceYears:
                      value,
                  })
                }
              />

              <QuickSelect
                value={
                  quick.englishLevel
                }
                options={
                  languageOptions
                }
                emptyLabel="—"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    englishLevel:
                      value as
                      | ''
                      | LanguageLevel,
                  })
                }
              />

              <QuickSelect
                value={
                  quick.russianLevel
                }
                options={
                  languageOptions
                }
                emptyLabel="—"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    russianLevel:
                      value as
                      | ''
                      | LanguageLevel,
                  })
                }
              />

              <QuickSelect
                value={
                  quick.uzbekLevel
                }
                options={
                  languageOptions
                }
                emptyLabel="—"
                onChange={(
                  value,
                ) =>
                  setQuick({
                    ...quick,
                    uzbekLevel:
                      value as
                      | ''
                      | LanguageLevel,
                  })
                }
              />

              <QuickSelect
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
                      value as
                      TalentStatus,
                  })
                }
              />

              <div className="text-center text-xs text-slate-400">
                Auto
              </div>

              <div className="text-center text-[11px] text-slate-400">
                after save
              </div>

              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() =>
                    void saveQuickTalent()
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
                      ...emptyQuickTalent,
                    });

                    setQuickOpen(
                      false,
                    );
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white"
                >
                  <X
                    size={15}
                  />
                </button>
              </div>
            </div>
          )}

          {filteredTalents.map(
            (
              talent,
              index,
            ) => (
              <div
                key={
                  talent.id
                }
                className={[
                  `grid ${grid} items-stretch px-4 text-sm`,

                  index %
                    2 ===
                  0
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50/70 dark:bg-slate-950/40',

                  index !==
                  filteredTalents.length -
                    1
                    ? 'border-b border-slate-100 dark:border-slate-800'
                    : '',
                ].join(
                  ' ',
                )}
              >
                <div className="flex min-h-14 items-center justify-center text-[13px] text-slate-400">
                  {index +
                    1}
                </div>

                <EditableText
                  value={
                    talent.fullName
                  }
                  bold
                  required
                  onSave={(
                    value,
                  ) =>
                    updateTalent(
                      talent.id,
                      {
                        fullName:
                          value,
                      },
                    )
                  }
                />

                <EditableText
                  value={
                    talent.phone ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    updateTalent(
                      talent.id,
                      {
                        phone:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <EditableText
                  value={
                    talent.telegram ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    updateTalent(
                      talent.id,
                      {
                        telegram:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <EditableText
                  value={
                    talent.location ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    updateTalent(
                      talent.id,
                      {
                        location:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <EditableNumber
                  value={
                    talent.experienceYears
                  }
                  onSave={(
                    value,
                  ) =>
                    updateTalent(
                      talent.id,
                      {
                        experienceYears:
                          value,
                      },
                    )
                  }
                />

                {[
                  'English',
                  'Russian',
                  'Uzbek',
                ].map(
                  (
                    language,
                  ) => {
                    const current =
                      talent.languages.find(
                        (
                          item,
                        ) =>
                          item.language.toLowerCase() ===
                          language.toLowerCase(),
                      );

                    return (
                      <InlineSelect
                        key={
                          language
                        }
                        value={
                          current?.level ||
                          ''
                        }
                        options={
                          languageOptions
                        }
                        emptyLabel="—"
                        onChange={(
                          value,
                        ) =>
                          void updateLanguage(
                            talent,
                            language,
                            value,
                          )
                        }
                      />
                    );
                  },
                )}

                <StatusSelect
                  value={
                    talent.status
                  }
                  onChange={(
                    value,
                  ) =>
                    void updateTalent(
                      talent.id,
                      {
                        status:
                          value,
                      },
                    )
                  }
                />

                <div className="flex min-h-14 items-center px-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {formatDate(
                    talent.createdAt,
                  )}
                </div>

                <TalentCvCell
                  talentId={
                    talent.id
                  }
                  cv={
                    cvByTalentId[
                      talent.id
                    ] ||
                    null
                  }
                  onChanged={
                    onChanged
                  }
                  onError={
                    onError
                  }
                />

                <div className="flex min-h-14 items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/talents/${talent.id}`,
                      )
                    }
                    title="Full details"
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
                        talent,
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

          {filteredTalents.length ===
            0 &&
            !quickOpen && (
              <div className="px-6 py-14 text-center text-sm text-slate-400">
                No matching talents.
              </div>
            )}
        </div>
      </div>
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
        min={
          type ===
          'number'
            ? 0
            : undefined
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
            event.target.value,
          )
        }
        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950"
      />
    </div>
  );
}

function QuickSelect({
  value,
  options,
  onChange,
  emptyLabel,
}: {
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (
    value: string,
  ) => void;
  emptyLabel?: string;
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
            event.target.value,
          )
        }
        className="h-8 w-full appearance-none rounded-md border border-slate-200 bg-white px-2 pr-7 text-xs dark:border-slate-700 dark:bg-slate-950"
      >
        {emptyLabel !==
          undefined && (
          <option value="">
            {
              emptyLabel
            }
          </option>
        )}

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
  required = false,
  bold = false,
}: {
  value: string;
  onSave: (
    value: string,
  ) => Promise<void>;
  required?: boolean;
  bold?: boolean;
}) {
  const [
    draft,
    setDraft,
  ] =
    useState(
      value,
    );

  return (
    <div className="flex min-h-14 items-center px-1">
      <input
        value={
          draft
        }
        onChange={(
          event,
        ) =>
          setDraft(
            event.target.value,
          )
        }
        onBlur={() => {
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
            next !==
            value
          ) {
            void onSave(
              next,
            );
          }
        }}
        className={[
          'h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-sm outline-none hover:border-slate-200 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950',

          bold
            ? 'font-semibold text-slate-900 dark:text-slate-100'
            : 'text-slate-600 dark:text-slate-300',
        ].join(
          ' ',
        )}
      />
    </div>
  );
}

function EditableNumber({
  value,
  onSave,
}: {
  value:
    | number
    | null
    | undefined;

  onSave: (
    value:
      | number
      | null,
  ) =>
    Promise<void>;
}) {
  return (
    <div className="flex min-h-14 items-center px-1">
      <input
        type="number"
        min={0}
        max={100}
        defaultValue={
          value ??
          ''
        }
        onBlur={(
          event,
        ) => {
          const clean =
            event.target.value
              .trim();

          const next =
            clean
              ? Number(
                  clean,
                )
              : null;

          if (
            next !==
            value
          ) {
            void onSave(
              next,
            );
          }
        }}
        className="h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-center text-sm text-slate-600 outline-none hover:border-slate-200 focus:border-emerald-500 focus:bg-white dark:text-slate-300 dark:focus:bg-slate-950"
      />
    </div>
  );
}

function InlineSelect({
  value,
  options,
  onChange,
  emptyLabel,
}: {
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (
    value: string,
  ) => void;
  emptyLabel?: string;
}) {
  return (
    <div className="relative flex min-h-14 items-center px-1">
      <select
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="h-8 w-full appearance-none rounded-md border border-transparent bg-transparent px-2 pr-7 text-xs font-medium text-slate-600 outline-none hover:border-slate-200 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-950"
      >
        {emptyLabel !==
          undefined && (
          <option value="">
            {
              emptyLabel
            }
          </option>
        )}

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

function StatusSelect({
  value,
  onChange,
}: {
  value:
    TalentStatus;

  onChange: (
    value:
      TalentStatus,
  ) => void;
}) {
  return (
    <div className="relative flex min-h-14 items-center px-1">
      <select
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value as
              TalentStatus,
          )
        }
        className="h-8 w-full appearance-none rounded-full border border-slate-200 bg-slate-50 px-3 pr-7 text-[10px] font-semibold outline-none dark:border-slate-700 dark:bg-slate-800"
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

function formatDate(
  value: string,
) {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—';
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      day:
        '2-digit',
      month:
        '2-digit',
      year:
        'numeric',
    },
  );
}
