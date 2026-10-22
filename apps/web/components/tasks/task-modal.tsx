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

  assigneeIds: string[];

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
  useEffect(() => {
    if (!open) {
      return;
    }

    const bodyOverflow =
      document.body.style
        .overflow;

    const bodyOverflowX =
      document.body.style
        .overflowX;

    const htmlOverflow =
      document.documentElement.style
        .overflow;

    const htmlOverflowX =
      document.documentElement.style
        .overflowX;

    document.body.style.overflow =
      'hidden';

    document.body.style.overflowX =
      'hidden';

    document.documentElement.style.overflow =
      'hidden';

    document.documentElement.style.overflowX =
      'hidden';

    window.scrollTo({
      left: 0,
      top: window.scrollY,
    });

    return () => {
      document.body.style.overflow =
        bodyOverflow;

      document.body.style.overflowX =
        bodyOverflowX;

      document.documentElement.style.overflow =
        htmlOverflow;

      document.documentElement.style.overflowX =
        htmlOverflowX;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === 'Escape' &&
        !saving
      ) {
        onClose();
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    open,
    saving,
    onClose,
  ]);

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
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        w-screen
        max-w-[100vw]
        items-end
        justify-center
        overflow-x-hidden
        bg-slate-950/40
        backdrop-blur-[2px]
        dark:bg-black/70
        sm:items-center
        sm:p-5
      "
    >
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

      <div
        className="
          relative
          z-10
          flex
          h-[calc(100dvh-8px)]
          w-full
          max-w-full
          min-w-0
          flex-col
          overflow-hidden
          rounded-t-[24px]
          border
          border-slate-200
          bg-white
          shadow-2xl
          dark:border-slate-800
          dark:bg-slate-900

          sm:h-auto
          sm:max-h-[calc(100dvh-40px)]
          sm:max-w-[620px]
          sm:rounded-2xl
        "
        style={{
          touchAction:
            'pan-y',
        }}
      >
        <div className="flex min-w-0 shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-6 sm:py-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {editingTask
                ? 'Edit task'
                : 'New task'}
            </h2>

            <p className="mt-1 max-w-full text-sm leading-5 text-slate-500 dark:text-slate-400">
              Assign work to one or more team
              members and track its
              progress.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:h-9 sm:w-9 sm:rounded-lg"
            aria-label="Close"
          >
            <X
              size={
                18
              }
            />
          </button>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="w-full min-w-0 max-w-full space-y-5 overflow-x-hidden p-4 pb-6 sm:p-6">
            <div className="min-w-0">
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Task
              </label>

              <input
                value={
                  value.title
                }
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
                className="h-12 w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[16px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-slate-500 dark:focus:ring-slate-800 sm:h-11 sm:text-sm"
              />
            </div>

            <div className="min-w-0">
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
                className="min-h-[120px] w-full min-w-0 max-w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[16px] leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-slate-500 dark:focus:ring-slate-800 sm:text-sm"
              />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Assign to
                </label>

                <MultiAssigneeSelect
                  value={
                    value.assigneeIds
                  }
                  users={users}
                  onChange={(
                    next,
                  ) =>
                    update(
                      'assigneeIds',
                      next,
                    )
                  }
                />
              </div>

              <div className="min-w-0">
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

              <div className="min-w-0">
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

              <div className="min-w-0">
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
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:bg-slate-50/60 sm:px-6 sm:py-4 dark:sm:bg-slate-950/40">
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              disabled={
                saving
              }
              onClick={
                onClose
              }
              className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:h-10 sm:rounded-lg sm:px-4"
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
              className="h-11 min-w-0 rounded-xl bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white sm:h-10 sm:rounded-lg sm:px-5"
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
    </div>
  );
}

function MultiAssigneeSelect({
  value,
  users,
  onChange,
}: {
  value: string[];
  users: TaskUser[];
  onChange: (
    value: string[],
  ) => void;
}) {
  const [open, setOpen] =
    useState(false);

  const wrapperRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const selectedUsers =
    users.filter(
      (user) =>
        value.includes(
          user.id,
        ),
    );

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
        setOpen(false);
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
        passive: true,
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

  function toggleUser(
    userId: string,
  ) {
    if (
      value.includes(
        userId,
      )
    ) {
      onChange(
        value.filter(
          (id) =>
            id !== userId,
        ),
      );
      return;
    }

    onChange([
      ...value,
      userId,
    ]);
  }

  return (
    <div
      ref={wrapperRef}
      className="min-w-0 max-w-full"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current,
          )
        }
        className={[
          'flex min-h-12 w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-xl border bg-white px-3.5 py-2 text-left text-[16px] outline-none transition dark:bg-slate-950 sm:min-h-11 sm:text-sm',
          open
            ? 'border-slate-400 ring-2 ring-slate-100 dark:border-slate-500 dark:ring-slate-800'
            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
        ].join(' ')}
      >
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {selectedUsers.length === 0 ? (
            <span className="text-slate-400 dark:text-slate-500">
              Unassigned
            </span>
          ) : (
            selectedUsers.map(
              (user) => (
                <span
                  key={user.id}
                  className="inline-flex max-w-full items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <span className="max-w-[140px] truncate">
                    {user.name}
                  </span>
                </span>
              ),
            )
          )}
        </div>

        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className={[
            'ml-auto shrink-0 text-slate-400 transition-transform duration-150 dark:text-slate-500',
            open
              ? 'rotate-180'
              : '',
          ].join(' ')}
        />
      </button>

      {open && (
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          <div className="max-h-[280px] overflow-x-hidden overflow-y-auto overscroll-contain">
            {users.length === 0 ? (
              <div className="px-3 py-4 text-sm text-slate-400 dark:text-slate-500">
                No team members available.
              </div>
            ) : (
              users.map(
                (user) => {
                  const active =
                    value.includes(
                      user.id,
                    );

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() =>
                        toggleUser(
                          user.id,
                        )
                      }
                      className={[
                        'flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition',
                        active
                          ? 'bg-slate-100 dark:bg-slate-800'
                          : 'hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/70 dark:active:bg-slate-800',
                      ].join(' ')}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={[
                            'truncate text-sm',
                            active
                              ? 'font-medium text-slate-900 dark:text-slate-100'
                              : 'text-slate-700 dark:text-slate-300',
                          ].join(' ')}
                        >
                          {user.name}
                        </p>

                        {user.position && (
                          <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">
                            {user.position}
                          </p>
                        )}
                      </div>

                      <span
                        className={[
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition',
                          active
                            ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                            : 'border-slate-300 text-transparent dark:border-slate-600',
                        ].join(' ')}
                      >
                        <Check
                          size={13}
                          strokeWidth={2.2}
                        />
                      </span>
                    </button>
                  );
                },
              )
            )}
          </div>

          {value.length > 0 && (
            <div className="border-t border-slate-100 p-1.5 pb-0 dark:border-slate-800">
              <button
                type="button"
                onClick={() =>
                  onChange([])
                }
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
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
  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    openUpward,
    setOpenUpward,
  ] =
    useState(false);

  const wrapperRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const selected =
    options.find(
      (option) =>
        option.value ===
        value,
    );

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
        passive: true,
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

  function toggleDropdown() {
    if (open) {
      setOpen(
        false,
      );

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

      setOpenUpward(
        availableBelow <
          estimatedMenuHeight +
            16 &&
          availableAbove >
            availableBelow,
      );
    }

    setOpen(
      true,
    );
  }

  return (
    <div
      ref={
        wrapperRef
      }
      className="relative min-w-0 max-w-full"
    >
      <button
        type="button"
        onClick={
          toggleDropdown
        }
        className={[
          'flex h-12 w-full min-w-0 max-w-full items-center justify-between overflow-hidden rounded-xl border bg-white px-3.5 text-left text-[16px] outline-none transition dark:bg-slate-950 sm:h-11 sm:text-sm',

          open
            ? 'border-slate-400 ring-2 ring-slate-100 dark:border-slate-500 dark:ring-slate-800'
            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
        ].join(' ')}
      >
        <span
          className={[
            'min-w-0 flex-1 truncate',

            selected
              ? 'text-slate-800 dark:text-slate-100'
              : 'text-slate-400 dark:text-slate-500',
          ].join(' ')}
        >
          {selected?.label ||
            placeholder}
        </span>

        <ChevronDown
          size={
            16
          }
          strokeWidth={
            1.8
          }
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
            'absolute left-0 right-0 z-[200] max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30',

            openUpward
              ? 'bottom-[calc(100%+6px)]'
              : 'top-[calc(100%+6px)]',
          ].join(' ')}
        >
          <div className="max-h-[min(280px,42dvh)] overflow-x-hidden overflow-y-auto overscroll-contain">
            {options.map(
              (
                option,
              ) => {
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

                      setOpen(
                        false,
                      );
                    }}
                    className={[
                      'flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition',

                      active
                        ? 'bg-slate-100 dark:bg-slate-800'
                        : 'hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/70 dark:active:bg-slate-800',
                    ].join(' ')}
                  >
                    <div className="min-w-0 flex-1">
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
                        size={
                          15
                        }
                        strokeWidth={
                          2
                        }
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
      input.click();
    }
  }

  return (
    <div className="relative min-w-0 max-w-full">
      <input
        ref={
          inputRef
        }
        type="date"
        value={
          value
        }
        min="2020-01-01"
        max="2099-12-31"
        onChange={(
          event,
        ) => {
          const next =
            event.target
              .value;

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
            year >=
              2020 &&
            year <=
              2099
          ) {
            onChange(
              next,
            );
          }
        }}
        className="
          h-12
          w-full
          min-w-0
          max-w-full
          rounded-xl
          border
          border-slate-200
          bg-white
          px-3.5
          pr-11
          text-[16px]
          text-slate-800
          outline-none
          transition

          hover:border-slate-300
          focus:border-slate-400
          focus:ring-2
          focus:ring-slate-100

          dark:border-slate-700
          dark:bg-slate-950
          dark:text-slate-100
          dark:hover:border-slate-600
          dark:focus:border-slate-500
          dark:focus:ring-slate-800

          sm:h-11
          sm:text-sm

          [&::-webkit-calendar-picker-indicator]:absolute
          [&::-webkit-calendar-picker-indicator]:right-3
          [&::-webkit-calendar-picker-indicator]:h-5
          [&::-webkit-calendar-picker-indicator]:w-5
          [&::-webkit-calendar-picker-indicator]:cursor-pointer
          [&::-webkit-calendar-picker-indicator]:opacity-0
        "
      />

      <button
        type="button"
        onClick={
          openCalendar
        }
        tabIndex={
          -1
        }
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        aria-label="Open calendar"
      >
        <CalendarDays
          size={
            17
          }
          strokeWidth={
            1.8
          }
        />
      </button>
    </div>
  );
}