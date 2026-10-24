'use client';

import {
  Check,
  ChevronDown,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import {
  useState,
} from 'react';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

export type ResidentApplication = {
  id: string;
  companyName: string;
  tin?: string | null;
  activity?: string | null;
  exporter: boolean;
  founderCountry?: string | null;
  region?: string | null;
  district?: string | null;
  appliedAt?: string | null;
  focalPoint?: string | null;
  broughtBy?: string | null;
  status:
    | 'PENDING'
    | 'REJECTED'
    | 'APPROVED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

type Draft = {
  companyName: string;
  tin: string;
  activity: string;
  exporter: boolean;
  founderCountry: string;
  district: string;
  appliedAt: string;
  focalPoint: string;
  status:
    | 'PENDING'
    | 'REJECTED';
};

const emptyDraft:
  Draft = {
  companyName: '',
  tin: '',
  activity: '',
  exporter: false,
  founderCountry: '',
  district: '',
  appliedAt:
    new Date()
      .toISOString()
      .slice(
        0,
        10,
      ),
  focalPoint: '',
  status: 'PENDING',
};

const grid =
  'grid-cols-[64px_2.1fr_1fr_1.3fr_0.8fr_1.3fr_1.2fr_1.25fr_1.5fr_1fr_64px]';

const statusOptions = [
  {
    value:
      'PENDING',

    label:
      'PENDING',
  },
  {
    value:
      'REJECTED',

    label:
      'REJECTED',
  },
  {
    value:
      'APPROVED',

    label:
      'APPROVED',
  },
];

export default function BecomingResidentsTable({
  applications,
  onChanged,
  onError,
}: {
  applications:
    ResidentApplication[];

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
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    draft,
    setDraft,
  ] =
    useState<Draft>({
      ...emptyDraft,
    });

  async function createApplication() {
    if (
      !draft.companyName.trim()
    ) {
      onError(
        'Company name is required.',
      );

      return;
    }

    try {
      setSaving(
        true,
      );

      onError('');

      await apiFetch(
        '/residents/applications',
        {
          method:
            'POST',

          body:
            JSON.stringify({
              ...draft,

              companyName:
                draft.companyName.trim(),

              tin:
                draft.tin.trim() ||
                undefined,

              activity:
                draft.activity.trim() ||
                undefined,

              founderCountry:
                draft.founderCountry.trim() ||
                undefined,

              district:
                draft.district.trim() ||
                undefined,

              focalPoint:
                draft.focalPoint.trim() ||
                undefined,
            }),
        },
      );

      setDraft({
        ...emptyDraft,

        appliedAt:
          new Date()
            .toISOString()
            .slice(
              0,
              10,
            ),
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
          : 'Unable to add application.',
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  async function patch(
    application:
      ResidentApplication,

    data:
      Record<
        string,
        unknown
      >,
  ) {
    try {
      onError('');

      if (
        data.status ===
        'APPROVED'
      ) {
        await apiFetch(
          `/residents/applications/${application.id}/approve`,
          {
            method:
              'POST',
          },
        );
      } else {
        await apiFetch(
          `/residents/applications/${application.id}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify(
                data,
              ),
          },
        );
      }

      await onChanged();
    } catch (error) {
      onError(
        error instanceof
        ApiError
          ? error.message
          : 'Unable to update application.',
      );

      throw error;
    }
  }

  async function remove(
    application:
      ResidentApplication,
  ) {
    try {
      onError('');

      await apiFetch(
        `/residents/applications/${application.id}`,
        {
          method:
            'DELETE',
        },
      );

      await onChanged();
    } catch (error) {
      onError(
        error instanceof
        ApiError
          ? error.message
          : 'Unable to delete application.',
      );
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Residency applications
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            Approved companies automatically move to Resident list.
          </p>
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
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <Plus
            size={14}
          />

          Add applicant
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1450px]">
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
            <div>Ariza sanasi</div>
            <div>FOCAL POINT</div>
            <div>Holati</div>
            <div />
          </div>

          {quickOpen && (
            <div
              className={`grid ${grid} items-center border-b border-amber-200 bg-amber-50/50 px-4 py-2 dark:border-amber-900/50 dark:bg-amber-950/10`}
            >
              <div className="text-center text-xs font-medium text-amber-600">
                NEW
              </div>

              <QuickInput
                value={
                  draft.companyName
                }
                placeholder="Company name *"
                onChange={(
                  value,
                ) =>
                  setDraft({
                    ...draft,
                    companyName:
                      value,
                  })
                }
              />

              <QuickInput
                value={
                  draft.tin
                }
                placeholder="STIR"
                onChange={(
                  value,
                ) =>
                  setDraft({
                    ...draft,
                    tin:
                      value,
                  })
                }
              />

              <QuickInput
                value={
                  draft.activity
                }
                placeholder="Activity"
                onChange={(
                  value,
                ) =>
                  setDraft({
                    ...draft,
                    activity:
                      value,
                  })
                }
              />

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      exporter:
                        !draft.exporter,
                    })
                  }
                  className={[
                    'flex h-7 w-7 items-center justify-center rounded-md border transition',

                    draft.exporter
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 bg-white text-transparent',
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
                  draft.founderCountry
                }
                placeholder="Country"
                onChange={(
                  value,
                ) =>
                  setDraft({
                    ...draft,
                    founderCountry:
                      value,
                  })
                }
              />

              <QuickInput
                value={
                  draft.district
                }
                placeholder="Hudud"
                onChange={(
                  value,
                ) =>
                  setDraft({
                    ...draft,
                    district:
                      value,
                  })
                }
              />

              <QuickInput
                type="date"
                value={
                  draft.appliedAt
                }
                onChange={(
                  value,
                ) =>
                  setDraft({
                    ...draft,
                    appliedAt:
                      value,
                  })
                }
              />

              <QuickInput
                value={
                  draft.focalPoint
                }
                placeholder="Focal point"
                onChange={(
                  value,
                ) =>
                  setDraft({
                    ...draft,
                    focalPoint:
                      value,
                  })
                }
              />

              <StatusSelect
                value={
                  draft.status
                }
                options={
                  statusOptions.slice(
                    0,
                    2,
                  )
                }
                onChange={(
                  value,
                ) =>
                  setDraft({
                    ...draft,
                    status:
                      value as
                        | 'PENDING'
                        | 'REJECTED',
                  })
                }
              />

              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() =>
                    void createApplication()
                  }
                  disabled={
                    saving
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white disabled:opacity-50"
                >
                  <Check
                    size={15}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setQuickOpen(
                      false,
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white"
                >
                  <X
                    size={15}
                  />
                </button>
              </div>
            </div>
          )}

          {applications.map(
            (
              application,
              index,
            ) => (
              <div
                key={
                  application.id
                }
                className={[
                  `grid ${grid} items-stretch px-4 text-sm`,

                  index %
                    2 ===
                  0
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50/70 dark:bg-slate-950/40',

                  index !==
                  applications.length -
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

                <EditableInput
                  value={
                    application.companyName
                  }
                  bold
                  onSave={(
                    value,
                  ) =>
                    patch(
                      application,
                      {
                        companyName:
                          value,
                      },
                    )
                  }
                />

                <EditableInput
                  value={
                    application.tin ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    patch(
                      application,
                      {
                        tin:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <EditableInput
                  value={
                    application.activity ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    patch(
                      application,
                      {
                        activity:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <button
                  type="button"
                  onDoubleClick={() =>
                    void patch(
                      application,
                      {
                        exporter:
                          !application.exporter,
                      },
                    )
                  }
                  className="flex min-h-14 items-center justify-center"
                >
                  {application.exporter
                    ? (
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        1
                      </span>
                    )
                    : (
                      <span className="text-slate-300">
                        —
                      </span>
                    )}
                </button>

                <EditableInput
                  value={
                    application.founderCountry ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    patch(
                      application,
                      {
                        founderCountry:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <EditableInput
                  value={
                    application.district ||
                    application.region ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    patch(
                      application,
                      {
                        district:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <div className="flex min-h-14 items-center px-1">
                  <input
                    type="date"
                    value={
                      application.appliedAt
                        ? application.appliedAt.slice(
                            0,
                            10,
                          )
                        : ''
                    }
                    onChange={(
                      event,
                    ) =>
                      void patch(
                        application,
                        {
                          appliedAt:
                            event.target.value ||
                            null,
                        },
                      )
                    }
                    className="h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-xs text-slate-600 outline-none hover:border-slate-200 focus:border-emerald-500 dark:text-slate-300"
                  />
                </div>

                <EditableInput
                  value={
                    application.focalPoint ||
                    ''
                  }
                  onSave={(
                    value,
                  ) =>
                    patch(
                      application,
                      {
                        focalPoint:
                          value ||
                          null,
                      },
                    )
                  }
                />

                <div className="flex min-h-14 items-center px-1">
                  <StatusSelect
                    value={
                      application.status
                    }
                    options={
                      statusOptions
                    }
                    onChange={(
                      value,
                    ) =>
                      void patch(
                        application,
                        {
                          status:
                            value,
                        },
                      )
                    }
                    badge
                  />
                </div>

                <div className="flex min-h-14 items-center justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      void remove(
                        application,
                      )
                    }
                    title="Delete application"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2
                      size={14}
                    />
                  </button>
                </div>
              </div>
            ),
          )}

          {applications.length ===
            0 &&
            !quickOpen && (
              <div className="px-6 py-14 text-center text-sm text-slate-400">
                No residency applications.
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

function EditableInput({
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
            next !==
            value
          ) {
            void onSave(
              next,
            );
          }
        }}
        className={[
          'h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-sm text-slate-600 outline-none hover:border-slate-200 focus:border-emerald-500 focus:bg-white dark:text-slate-300 dark:focus:bg-slate-950',

          bold
            ? 'font-medium text-slate-900 dark:text-slate-100'
            : '',
        ].join(
          ' ',
        )}
      />
    </div>
  );
}

function StatusSelect({
  value,
  options,
  onChange,
  badge = false,
}: {
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (
    value: string,
  ) => void;
  badge?: boolean;
}) {
  const style =
    value ===
    'PENDING'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : value ===
          'REJECTED'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <div className="relative w-full">
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
        className={[
          'h-8 w-full appearance-none rounded-md border px-2 pr-7 text-xs font-semibold outline-none',

          badge
            ? style
            : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
        ].join(
          ' ',
        )}
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
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-current opacity-60"
      />
    </div>
  );
}
