'use client';

import {
  Archive,
  Check,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import {
  useRef,
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

  founderCountry?:
    | string
    | null;

  region?:
    | string
    | null;

  district?:
    | string
    | null;

  residentSince?:
    | string
    | null;

  focalPoint?:
    | string
    | null;

  broughtBy?:
    | string
    | null;

  status: string;

  notes?:
    | string
    | null;

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
  status: 'ACTIVE',
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
    label: 'TO‘XTATILGAN',
  },
  {
    value: 'ARCHIVED',
    label: 'FAOL EMAS',
  },
];

export default function ResidentTable({
  residents,
  onEdit,
  onArchive,
  onDelete,
  onChanged,
  onError,
}: {
  residents: Resident[];

  onEdit: (
    resident: Resident,
  ) => void;

  onArchive: (
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
  ] = useState(false);

  const [
    quickSaving,
    setQuickSaving,
  ] = useState(false);

  const [
    quick,
    setQuick,
  ] =
    useState<QuickResident>({
      ...emptyQuickResident,
    });

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
          method: 'PATCH',

          body:
            JSON.stringify(
              patch,
            ),
        },
      );

      await onChanged();
    } catch (error) {
      const message =
        error instanceof ApiError
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
          method: 'POST',

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
        error instanceof ApiError
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
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Double-click any cell to edit
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setQuickOpen(
              (current) =>
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

      <div className="overflow-x-auto">
        <div className="min-w-[1220px]">
          <div className="grid grid-cols-[64px_2.2fr_1fr_1.35fr_0.85fr_1.35fr_1.2fr_1.35fr_1fr_112px] items-center border-b border-[#2f6655] bg-[#356b5a] px-4 py-3.5 text-[12px] font-semibold text-white dark:border-[#244d41] dark:bg-[#284f43]">
            <div className="text-center">
              T/r
            </div>

            <div>
              Nomi
            </div>

            <div>
              STIR
            </div>

            <div>
              Faoliyat turi
            </div>

            <div className="text-center">
              Eksportyor
            </div>

            <div>
              Ta&apos;sischi
              davlat
            </div>

            <div>
              Hudud
            </div>

            <div>
              Rezident
              bo&apos;lgan sana
            </div>

            <div>
              Holati
            </div>

            <div />
          </div>

          {quickOpen && (
            <QuickResidentRow
              value={
                quick
              }
              saving={
                quickSaving
              }
              onChange={
                setQuick
              }
              onSave={
                saveQuickResident
              }
              onCancel={() => {
                if (
                  !quickSaving
                ) {
                  setQuick({
                    ...emptyQuickResident,
                  });

                  setQuickOpen(
                    false,
                  );
                }
              }}
              onError={
                onError
              }
            />
          )}

          {residents.length ===
          0 ? (
            !quickOpen && (
              <div className="px-6 py-14 text-center text-sm text-slate-400 dark:text-slate-500">
                Rezidentlar
                topilmadi.
              </div>
            )
          ) : (
            residents.map(
              (
                resident,
                index,
              ) => (
                <div
                  key={
                    resident.id
                  }
                  className={[
                    'group grid grid-cols-[64px_2.2fr_1fr_1.35fr_0.85fr_1.35fr_1.2fr_1.35fr_1fr_112px] items-stretch px-4 text-sm transition-colors',

                    index %
                      2 ===
                    0
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-slate-50/70 dark:bg-slate-950/40',

                    'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',

                    index !==
                    residents.length -
                      1
                      ? 'border-b border-slate-100 dark:border-slate-800'
                      : '',
                  ].join(
                    ' ',
                  )}
                >
                  <div className="flex min-h-14 items-center justify-center text-[13px] font-medium text-slate-400 dark:text-slate-500">
                    {index + 1}
                  </div>

                  <EditableTextCell
                    value={
                      resident.companyName
                    }
                    required
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

                  <EditableTextCell
                    value={
                      resident.tin ||
                      ''
                    }
                    mono
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

                  <EditableTextCell
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

                  <EditableBooleanCell
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

                  <EditableCountryCell
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

                  <EditableTextCell
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

                  <EditableDateCell
                    value={
                      resident.residentSince ||
                      null
                    }
                    onSave={(
                      value,
                    ) =>
                      updateResident(
                        resident.id,
                        {
                          residentSince:
                            value,
                        },
                      )
                    }
                    onError={
                      onError
                    }
                  />

                  <EditableStatusCell
                    value={
                      resident.status
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
                      title="Full details"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <MoreHorizontal
                        size={15}
                      />
                    </button>

                    {resident.status !==
                      'ARCHIVED' && (
                      <button
                        type="button"
                        onClick={() =>
                          onArchive(
                            resident,
                          )
                        }
                        title="Archive resident"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Archive
                          size={14}
                        />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(
                          resident,
                        )
                      }
                      title="Delete resident"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                </div>
              ),
            )
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500 md:hidden">
        Jadvalni to‘liq
        ko‘rish uchun
        chapga/o‘ngga suring.
      </div>
    </div>
  );
}

function QuickResidentRow({
  value,
  saving,
  onChange,
  onSave,
  onCancel,
  onError,
}: {
  value:
    QuickResident;

  saving:
    boolean;

  onChange: (
    value:
      QuickResident,
  ) => void;

  onSave:
    () => Promise<void>;

  onCancel:
    () => void;

  onError: (
    message: string,
  ) => void;
}) {
  const companyRef =
    useRef<HTMLInputElement>(
      null,
    );

  function update<
    K extends keyof QuickResident,
  >(
    key: K,
    next:
      QuickResident[K],
  ) {
    onChange({
      ...value,
      [key]:
        next,
    });
  }

  return (
    <div className="grid grid-cols-[64px_2.2fr_1fr_1.35fr_0.85fr_1.35fr_1.2fr_1.35fr_1fr_112px] items-center gap-0 border-b border-emerald-200 bg-emerald-50/50 px-4 py-2 dark:border-emerald-900/50 dark:bg-emerald-950/10">
      <div className="text-center text-xs font-medium text-emerald-600 dark:text-emerald-500">
        NEW
      </div>

      <QuickInput
        inputRef={
          companyRef
        }
        value={
          value.companyName
        }
        placeholder="Company name *"
        onChange={(
          next,
        ) =>
          update(
            'companyName',
            next,
          )
        }
        onEnter={
          onSave
        }
      />

      <QuickInput
        value={
          value.tin
        }
        placeholder="STIR"
        onChange={(
          next,
        ) =>
          update(
            'tin',
            next,
          )
        }
        onEnter={
          onSave
        }
      />

      <QuickInput
        value={
          value.activity
        }
        placeholder="Activity"
        onChange={(
          next,
        ) =>
          update(
            'activity',
            next,
          )
        }
        onEnter={
          onSave
        }
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() =>
            update(
              'exporter',
              !value.exporter,
            )
          }
          className={[
            'flex h-7 w-7 items-center justify-center rounded-md border transition',

            value.exporter
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white text-transparent dark:border-slate-700 dark:bg-slate-950',
          ].join(
            ' ',
          )}
          title="Exporter"
        >
          <Check
            size={14}
          />
        </button>
      </div>

      <QuickInput
        value={
          value.founderCountry
        }
        placeholder="Country"
        onChange={(
          next,
        ) =>
          update(
            'founderCountry',
            next,
          )
        }
        onEnter={
          onSave
        }
      />

      <QuickInput
        value={
          value.district
        }
        placeholder="Hudud"
        onChange={(
          next,
        ) =>
          update(
            'district',
            next,
          )
        }
        onEnter={
          onSave
        }
      />

      <QuickDateInput
        value={
          value.residentSince
        }
        onChange={(
          next,
        ) =>
          update(
            'residentSince',
            next,
          )
        }
        onError={
          onError
        }
      />

      <div className="relative px-1">
        <select
          value={
            value.status
          }
          onChange={(
            event,
          ) =>
            update(
              'status',
              event.target
                .value,
            )
          }
          className="h-8 w-full appearance-none rounded-md border border-slate-200 bg-white px-2 pr-7 text-xs text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
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

      <div className="flex justify-end gap-1">
        <button
          type="button"
          onClick={() =>
            void onSave()
          }
          disabled={
            saving
          }
          title="Save"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <Check
            size={15}
          />
        </button>

        <button
          type="button"
          onClick={
            onCancel
          }
          disabled={
            saving
          }
          title="Cancel"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X
            size={15}
          />
        </button>
      </div>
    </div>
  );
}

function QuickInput({
  value,
  onChange,
  onEnter,
  placeholder,
  inputRef,
}: {
  value:
    string;

  onChange: (
    value: string,
  ) => void;

  onEnter:
    () => Promise<void>;

  placeholder?:
    string;

  inputRef?:
    React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="px-1">
      <input
        ref={
          inputRef
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
        onKeyDown={(
          event,
        ) => {
          if (
            event.key ===
            'Enter'
          ) {
            event.preventDefault();

            void onEnter();
          }
        }}
        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600"
      />
    </div>
  );
}

function EditableTextCell({
  value,
  onSave,
  required = false,
  bold = false,
  mono = false,
}: {
  value:
    string;

  onSave: (
    value: string,
  ) => Promise<void>;

  required?:
    boolean;

  bold?:
    boolean;

  mono?:
    boolean;
}) {
  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    draft,
    setDraft,
  ] = useState(
    value,
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const cancelRef =
    useRef(false);

  function beginEdit() {
    setDraft(
      value,
    );

    setEditing(
      true,
    );
  }

  async function save() {
    if (
      cancelRef.current
    ) {
      cancelRef.current =
        false;

      return;
    }

    const clean =
      draft.trim();

    if (
      required &&
      !clean
    ) {
      setDraft(
        value,
      );

      setEditing(
        false,
      );

      return;
    }

    if (
      clean ===
      value
    ) {
      setEditing(
        false,
      );

      return;
    }

    try {
      setSaving(
        true,
      );

      await onSave(
        clean,
      );

      setEditing(
        false,
      );
    } catch {
      setDraft(
        value,
      );
    } finally {
      setSaving(
        false,
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
          disabled={
            saving
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
              event.preventDefault();

              event.currentTarget.blur();
            }

            if (
              event.key ===
              'Escape'
            ) {
              event.preventDefault();

              cancelRef.current =
                true;

              setDraft(
                value,
              );

              setEditing(
                false,
              );
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
      onDoubleClick={
        beginEdit
      }
      title="Double-click to edit"
      className={[
        'min-h-14 min-w-0 px-2 text-left outline-none transition hover:bg-emerald-100/40 dark:hover:bg-emerald-950/20',

        bold
          ? 'font-medium text-slate-900 dark:text-slate-100'
          : 'text-slate-600 dark:text-slate-300',

        mono
          ? 'font-mono text-[13px]'
          : 'text-sm',
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

function EditableBooleanCell({
  value,
  onSave,
}: {
  value:
    boolean;

  onSave: (
    value: boolean,
  ) => Promise<void>;
}) {
  const [
    saving,
    setSaving,
  ] = useState(false);

  async function toggle() {
    if (saving) {
      return;
    }

    try {
      setSaving(
        true,
      );

      await onSave(
        !value,
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  return (
    <button
      type="button"
      onDoubleClick={() =>
        void toggle()
      }
      title="Double-click to change"
      className="flex min-h-14 items-center justify-center outline-none transition hover:bg-emerald-100/40 dark:hover:bg-emerald-950/20"
    >
      {value ? (
        <span className="inline-flex min-w-7 justify-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/50">
          1
        </span>
      ) : (
        <span className="text-slate-300 dark:text-slate-700">
          —
        </span>
      )}
    </button>
  );
}

function EditableCountryCell({
  value,
  onSave,
}: {
  value:
    string;

  onSave: (
    value: string,
  ) => Promise<void>;
}) {
  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    draft,
    setDraft,
  ] = useState(
    value,
  );

  const cancelRef =
    useRef(false);

  async function save() {
    if (
      cancelRef.current
    ) {
      cancelRef.current =
        false;

      return;
    }

    const clean =
      draft.trim();

    if (
      clean ===
      value
    ) {
      setEditing(
        false,
      );

      return;
    }

    try {
      await onSave(
        clean,
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
              cancelRef.current =
                true;

              setDraft(
                value,
              );

              setEditing(
                false,
              );
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
        setDraft(
          value,
        );

        setEditing(
          true,
        );
      }}
      title="Double-click to edit"
      className="flex min-h-14 items-center px-2 text-left outline-none transition hover:bg-emerald-100/40 dark:hover:bg-emerald-950/20"
    >
      {value ? (
        <CountryBadge
          country={
            value
          }
        />
      ) : (
        <span className="text-slate-300 dark:text-slate-700">
          —
        </span>
      )}
    </button>
  );
}

function EditableStatusCell({
  value,
  onSave,
}: {
  value:
    string;

  onSave: (
    value: string,
  ) => Promise<void>;
}) {
  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  if (editing) {
    return (
      <div className="relative flex min-h-14 items-center px-1">
        <select
          autoFocus
          value={
            value
          }
          disabled={
            saving
          }
          onChange={async (
            event,
          ) => {
            try {
              setSaving(
                true,
              );

              await onSave(
                event.target
                  .value,
              );

              setEditing(
                false,
              );
            } finally {
              setSaving(
                false,
              );
            }
          }}
          onBlur={() =>
            setEditing(
              false,
            )
          }
          className="h-8 w-full appearance-none rounded-md border border-emerald-500 bg-white px-2 pr-7 text-xs text-slate-700 outline-none dark:bg-slate-950 dark:text-slate-200"
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

  return (
    <button
      type="button"
      onDoubleClick={() =>
        setEditing(
          true,
        )
      }
      title="Double-click to edit"
      className="flex min-h-14 items-center px-2 text-left outline-none transition hover:bg-emerald-100/40 dark:hover:bg-emerald-950/20"
    >
      <StatusBadge
        status={
          value
        }
      />
    </button>
  );
}

function EditableDateCell({
  value,
  onSave,
  onError,
}: {
  value:
    | string
    | null;

  onSave: (
    value:
      | string
      | null,
  ) => Promise<void>;

  onError: (
    message: string,
  ) => void;
}) {
  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    draft,
    setDraft,
  ] = useState('');

  const cancelRef =
    useRef(false);

  function beginEdit() {
    setDraft(
      isoToDisplayDate(
        value ||
          '',
      ),
    );

    setEditing(
      true,
    );
  }

  async function save() {
    if (
      cancelRef.current
    ) {
      cancelRef.current =
        false;

      return;
    }

    if (
      !draft.trim()
    ) {
      await onSave(
        null,
      );

      setEditing(
        false,
      );

      return;
    }

    const iso =
      displayToIsoDate(
        draft,
      );

    if (!iso) {
      onError(
        'Date must be DD/MM/YYYY.',
      );

      setEditing(
        false,
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

    if (
      original ===
      iso
    ) {
      setEditing(
        false,
      );

      return;
    }

    await onSave(
      iso,
    );

    setEditing(
      false,
    );
  }

  if (editing) {
    return (
      <div className="flex min-h-14 items-center px-1">
        <input
          autoFocus
          value={
            draft
          }
          inputMode="numeric"
          placeholder="DD/MM/YYYY"
          onChange={(
            event,
          ) =>
            setDraft(
              maskDate(
                event.target
                  .value,
              ),
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
              event.preventDefault();

              event.currentTarget.blur();
            }

            if (
              event.key ===
              'Escape'
            ) {
              cancelRef.current =
                true;

              setEditing(
                false,
              );
            }
          }}
          className="h-8 w-full rounded-md border border-emerald-500 bg-white px-2 text-xs text-slate-900 outline-none ring-2 ring-emerald-500/10 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={
        beginEdit
      }
      title="Double-click to edit"
      className="min-h-14 px-2 text-left text-[13px] text-slate-600 outline-none transition hover:bg-emerald-100/40 dark:text-slate-300 dark:hover:bg-emerald-950/20"
    >
      {value
        ? new Date(
            value,
          ).toLocaleDateString(
            'en-GB',
          )
        : '—'}
    </button>
  );
}

function QuickDateInput({
  value,
  onChange,
  onError,
}: {
  value:
    string;

  onChange: (
    value: string,
  ) => void;

  onError: (
    message: string,
  ) => void;
}) {
  const [
    draft,
    setDraft,
  ] = useState(
    '',
  );

  return (
    <div className="px-1">
      <input
        value={
          draft
        }
        inputMode="numeric"
        placeholder="DD/MM/YYYY"
        onChange={(
          event,
        ) => {
          const next =
            maskDate(
              event.target
                .value,
            );

          setDraft(
            next,
          );

          if (
            next.length ===
            10
          ) {
            const iso =
              displayToIsoDate(
                next,
              );

            if (iso) {
              onError('');

              onChange(
                iso,
              );
            }
          } else {
            onChange(
              '',
            );
          }
        }}
        onBlur={() => {
          if (
            !draft
          ) {
            onChange(
              '',
            );

            return;
          }

          const iso =
            displayToIsoDate(
              draft,
            );

          if (!iso) {
            onError(
              'Date must be DD/MM/YYYY.',
            );

            setDraft(
              '',
            );

            onChange(
              '',
            );
          }
        }}
        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600"
      />
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles:
    Record<
      string,
      string
    > = {
    ACTIVE:
      'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/50',

    INACTIVE:
      'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',

    SUSPENDED:
      'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/50',

    ARCHIVED:
      'bg-red-100 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900/50',
  };

  const labels:
    Record<
      string,
      string
    > = {
    ACTIVE:
      'FAOL',

    INACTIVE:
      'NOFAOL',

    SUSPENDED:
      'TO‘XTATILGAN',

    ARCHIVED:
      'FAOL EMAS',
  };

  return (
    <span
      className={[
        'inline-flex min-w-[82px] justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',

        styles[
          status
        ] ??
          'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
      ].join(
        ' ',
      )}
    >
      {labels[
        status
      ] ??
        status}
    </span>
  );
}

function CountryBadge({
  country,
}: {
  country:
    string;
}) {
  const normalized =
    country
      .trim()
      .toLowerCase()
      .replace(
        /ʻ|’|`/g,
        "'",
      );

  const isUzbekistan =
    normalized ===
      "o'zbekiston" ||
    normalized ===
      'uzbekistan';

  return (
    <span
      className={[
        'inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset',

        isUzbekistan
          ? 'bg-yellow-100 text-yellow-800 ring-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:ring-yellow-900/50'
          : 'bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-900/50',
      ].join(
        ' ',
      )}
    >
      <span className="truncate">
        {country}
      </span>
    </span>
  );
}

function maskDate(
  value: string,
) {
  const digits =
    value
      .replace(
        /\D/g,
        '',
      )
      .slice(
        0,
        8,
      );

  if (
    digits.length <=
    2
  ) {
    return digits;
  }

  if (
    digits.length <=
    4
  ) {
    return `${digits.slice(
      0,
      2,
    )}/${digits.slice(
      2,
    )}`;
  }

  return `${digits.slice(
    0,
    2,
  )}/${digits.slice(
    2,
    4,
  )}/${digits.slice(
    4,
  )}`;
}

function displayToIsoDate(
  value: string,
) {
  const match =
    value.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
    );

  if (!match) {
    return null;
  }

  const day =
    Number(
      match[1],
    );

  const month =
    Number(
      match[2],
    );

  const year =
    Number(
      match[3],
    );

  if (
    year < 1990 ||
    year > 2099
  ) {
    return null;
  }

  const date =
    new Date(
      year,
      month - 1,
      day,
    );

  if (
    date.getFullYear() !==
      year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !==
      day
  ) {
    return null;
  }

  return `${String(
    year,
  ).padStart(
    4,
    '0',
  )}-${String(
    month,
  ).padStart(
    2,
    '0',
  )}-${String(
    day,
  ).padStart(
    2,
    '0',
  )}`;
}

function isoToDisplayDate(
  value: string,
) {
  if (!value) {
    return '';
  }

  const match =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})/,
    );

  if (!match) {
    return '';
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}