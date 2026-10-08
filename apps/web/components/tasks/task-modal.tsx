'use client';

import {
  CalendarDays,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  TaskItem,
  TaskUser,
} from './task-card';

export type TaskFormValue = {
  title: string;
  description: string;

  assigneeId: string;

  priority:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'URGENT';

  status:
    | 'TODO'
    | 'IN_PROGRESS'
    | 'DONE';

  dueDate: string;
};

type SelectOption = {
  value: string;
  label: string;
  secondary?: string;
};

export default function TaskModal({
  open,
  editingTask,
  value,
  users,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;

  editingTask:
    | TaskItem
    | null;

  value: TaskFormValue;

  users: TaskUser[];

  saving: boolean;

  onChange: (
    value: TaskFormValue,
  ) => void;

  onClose: () => void;
  onSave: () => void;
}) {
  if (!open) {
    return null;
  }

  function update<
    K extends keyof TaskFormValue,
  >(
    key: K,
    next:
      TaskFormValue[K],
  ) {
    onChange({
      ...value,
      [key]: next,
    });
  }

  const assigneeOptions:
    SelectOption[] = [
    {
      value: '',
      label: 'Unassigned',
    },

    ...users.map(
      (user) => ({
        value: user.id,
        label: user.name,
        secondary:
          user.position ||
          undefined,
      }),
    ),
  ];

  const priorityOptions:
    SelectOption[] = [
    {
      value: 'LOW',
      label: 'Low',
    },
    {
      value: 'MEDIUM',
      label: 'Medium',
    },
    {
      value: 'HIGH',
      label: 'High',
    },
    {
      value: 'URGENT',
      label: 'Urgent',
    },
  ];

  const statusOptions:
    SelectOption[] = [
    {
      value: 'TODO',
      label: 'To do',
    },
    {
      value: 'IN_PROGRESS',
      label: 'In progress',
    },
    {
      value: 'DONE',
      label: 'Done',
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-visible bg-slate-950/30 p-4 pt-[4vh] backdrop-blur-[2px] dark:bg-black/60 sm:p-5 sm:pt-[5vh]">
      <button
        type="button"
        onClick={() => {
          if (!saving) {
            onClose();
          }
        }}
        className="absolute inset-0"
        aria-label="Close task"
      />

      <div className="relative z-10 w-full max-w-[620px] overflow-visible rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {editingTask
                ? 'Edit task'
                : 'New task'}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Assign work to a team
              member and track its
              progress.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Task
            </label>

            <input
              autoFocus
              value={value.title}
              onChange={(
                event,
              ) =>
                update(
                  'title',
                  event.target
                    .value,
                )
              }
              placeholder="What needs to be done?"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-slate-500 dark:focus:ring-slate-800"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>

            <textarea
              rows={4}
              value={
                value.description
              }
              onChange={(
                event,
              ) =>
                update(
                  'description',
                  event.target
                    .value,
                )
              }
              placeholder="Add details if needed..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-slate-500 dark:focus:ring-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Assign to
              </label>

              <CustomSelect
                value={
                  value.assigneeId
                }
                options={
                  assigneeOptions
                }
                placeholder="Unassigned"
                onChange={(
                  next,
                ) =>
                  update(
                    'assigneeId',
                    next,
                  )
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Due date
              </label>

              <DateField
                value={
                  value.dueDate
                }
                onChange={(
                  next,
                ) =>
                  update(
                    'dueDate',
                    next,
                  )
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Priority
              </label>

              <CustomSelect
                value={
                  value.priority
                }
                options={
                  priorityOptions
                }
                onChange={(
                  next,
                ) =>
                  update(
                    'priority',
                    next as TaskFormValue['priority'],
                  )
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>

              <CustomSelect
                value={
                  value.status
                }
                options={
                  statusOptions
                }
                onChange={(
                  next,
                ) =>
                  update(
                    'status',
                    next as TaskFormValue['status'],
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              saving ||
              !value.title.trim()
            }
            onClick={
              onSave
            }
            className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {saving
              ? 'Saving...'
              : editingTask
                ? 'Save changes'
                : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomSelect({
  value,
  options,
  placeholder = 'Select',
  onChange,
}: {
  value: string;
  options: SelectOption[];
  placeholder?: string;

  onChange: (
    value: string,
  ) => void;
}) {
  const [open, setOpen] =
    useState(false);

  const [
    openUpward,
    setOpenUpward,
  ] = useState(false);

  const wrapperRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const selected =
    options.find(
      (option) =>
        option.value === value,
    );

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      );
    };
  }, []);

  function toggleDropdown() {
    if (open) {
      setOpen(false);
      return;
    }

    const element =
      wrapperRef.current;

    if (element) {
      const rect =
        element.getBoundingClientRect();

      const estimatedMenuHeight =
        Math.min(
          options.length *
            52 +
            16,
          280,
        );

      const availableBelow =
        window.innerHeight -
        rect.bottom;

      const availableAbove =
        rect.top;

      const shouldOpenUpward =
        availableBelow <
          estimatedMenuHeight +
            16 &&
        availableAbove >
          availableBelow;

      setOpenUpward(
        shouldOpenUpward,
      );
    }

    setOpen(true);
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        onClick={
          toggleDropdown
        }
        className={[
          'flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3.5 text-left text-sm outline-none transition dark:bg-slate-950',
          open
            ? 'border-slate-400 ring-2 ring-slate-100 dark:border-slate-500 dark:ring-slate-800'
            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
        ].join(' ')}
      >
        <span
          className={[
            'min-w-0 truncate',
            selected
              ? 'text-slate-800 dark:text-slate-100'
              : 'text-slate-400 dark:text-slate-500',
          ].join(' ')}
        >
          {selected?.label ||
            placeholder}
        </span>

        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className={[
            'ml-3 shrink-0 text-slate-400 transition-transform duration-150 dark:text-slate-500',
            open
              ? 'rotate-180'
              : '',
          ].join(' ')}
        />
      </button>

      {open && (
        <div
          className={[
            'absolute left-0 right-0 z-[999] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30',
            openUpward
              ? 'bottom-[calc(100%+6px)]'
              : 'top-[calc(100%+6px)]',
          ].join(' ')}
        >
          <div className="max-h-[280px] overflow-y-auto">
            {options.map(
              (option) => {
                const active =
                  option.value ===
                  value;

                return (
                  <button
                    key={
                      option.value ||
                      '__empty'
                    }
                    type="button"
                    onClick={() => {
                      onChange(
                        option.value,
                      );

                      setOpen(false);
                    }}
                    className={[
                      'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition',
                      active
                        ? 'bg-slate-100 dark:bg-slate-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/70',
                    ].join(' ')}
                  >
                    <div className="min-w-0">
                      <p
                        className={[
                          'truncate text-sm',
                          active
                            ? 'font-medium text-slate-900 dark:text-slate-100'
                            : 'text-slate-700 dark:text-slate-300',
                        ].join(' ')}
                      >
                        {
                          option.label
                        }
                      </p>

                      {option.secondary && (
                        <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">
                          {
                            option.secondary
                          }
                        </p>
                      )}
                    </div>

                    {active && (
                      <Check
                        size={15}
                        strokeWidth={2}
                        className="shrink-0 text-slate-700 dark:text-slate-300"
                      />
                    )}
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DateField({
  value,
  onChange,
}: {
  value: string;

  onChange: (
    value: string,
  ) => void;
}) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  function openCalendar() {
    const input =
      inputRef.current;

    if (!input) {
      return;
    }

    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="date"
        value={value}
        min="2020-01-01"
        max="2099-12-31"
        onChange={(
          event,
        ) => {
          const next =
            event.target.value;

          if (!next) {
            onChange('');
            return;
          }

          const year =
            Number(
              next.split(
                '-',
              )[0],
            );

          if (
            year >= 2020 &&
            year <= 2099
          ) {
            onChange(next);
          }
        }}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-11 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-slate-500 dark:focus:ring-slate-800 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
      />

      <button
        type="button"
        onClick={
          openCalendar
        }
        tabIndex={-1}
        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <CalendarDays
          size={17}
          strokeWidth={1.8}
        />
      </button>
    </div>
  );
}