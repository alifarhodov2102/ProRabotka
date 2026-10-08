'use client';

import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  X,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

import {
  TaskItem,
} from '@/components/tasks/task-card';

type NotificationItem = {
  id: string;

  type:
    | 'OVERDUE'
    | 'TODAY'
    | 'TOMORROW'
    | 'ASSIGNED';

  title: string;
  description: string;
  task: TaskItem;
};

export default function NotificationBell({
  onOpenTask,
}: {
  onOpenTask?: (
    taskId: string,
  ) => void;
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    tasks,
    setTasks,
  ] = useState<TaskItem[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const wrapperRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  async function loadTasks() {
    try {
      setLoading(true);

      const data =
        await apiFetch<
          TaskItem[]
        >('/tasks/my');

      setTasks(data);
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status !== 401
      ) {
        console.error(
          err.message,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();

    const interval =
      window.setInterval(
        loadTasks,
        60000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, []);

  useEffect(() => {
    function handleOutside(
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
      handleOutside,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutside,
      );
    };
  }, []);

  const notifications =
    useMemo<
      NotificationItem[]
    >(() => {
      const now =
        new Date();

      const today =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );

      const tomorrow =
        new Date(today);

      tomorrow.setDate(
        tomorrow.getDate() +
          1,
      );

      const afterTomorrow =
        new Date(
          tomorrow,
        );

      afterTomorrow.setDate(
        afterTomorrow.getDate() +
          1,
      );

      const result:
        NotificationItem[] = [];

      for (
        const task of tasks
      ) {
        if (
          task.status ===
          'DONE'
        ) {
          continue;
        }

        if (!task.dueDate) {
          result.push({
            id:
              `assigned-${task.id}`,

            type:
              'ASSIGNED',

            title:
              task.title,

            description:
              'Assigned to you',

            task,
          });

          continue;
        }

        const due =
          new Date(
            task.dueDate,
          );

        if (due < today) {
          result.push({
            id:
              `overdue-${task.id}`,

            type:
              'OVERDUE',

            title:
              task.title,

            description:
              `Overdue · ${formatDate(
                task.dueDate,
              )}`,

            task,
          });

          continue;
        }

        if (
          due >= today &&
          due < tomorrow
        ) {
          result.push({
            id:
              `today-${task.id}`,

            type:
              'TODAY',

            title:
              task.title,

            description:
              'Due today',

            task,
          });

          continue;
        }

        if (
          due >= tomorrow &&
          due <
            afterTomorrow
        ) {
          result.push({
            id:
              `tomorrow-${task.id}`,

            type:
              'TOMORROW',

            title:
              task.title,

            description:
              'Due tomorrow',

            task,
          });
        }
      }

      return result.sort(
        (a, b) =>
          notificationWeight(
            a.type,
          ) -
          notificationWeight(
            b.type,
          ),
      );
    }, [tasks]);

  const urgentCount =
    notifications.filter(
      (item) =>
        item.type ===
          'OVERDUE' ||
        item.type ===
          'TODAY',
    ).length;

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => {
          setOpen(
            (current) =>
              !current,
          );

          if (!open) {
            loadTasks();
          }
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label="Notifications"
      >
        <Bell
          size={18}
          strokeWidth={1.8}
        />

        {urgentCount >
          0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white ring-2 ring-[#f7f8fa] dark:ring-slate-950">
            {urgentCount >
            9
              ? '9+'
              : urgentCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[120] w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Notifications
              </h3>

              <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                Your tasks that
                need attention
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close notifications"
            >
              <X
                size={16}
              />
            </button>
          </div>

          <div className="max-h-[430px] overflow-y-auto p-2">
            {loading &&
            tasks.length ===
              0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                Loading...
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="px-4 py-10 text-center">
                <CheckCircle2
                  size={24}
                  className="mx-auto text-emerald-500 dark:text-emerald-400"
                />

                <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  You&apos;re
                  all caught up
                </p>

                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Nothing needs
                  your attention
                  right now.
                </p>
              </div>
            ) : (
              notifications.map(
                (item) => (
                  <NotificationRow
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                    onClick={() => {
                      setOpen(
                        false,
                      );

                      onOpenTask?.(
                        item.task
                          .id,
                      );
                    }}
                  />
                ),
              )
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-[10px] text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500">
            Updates
            automatically every
            minute
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  item,
  onClick,
}: {
  item:
    NotificationItem;

  onClick: () => void;
}) {
  const icon =
    item.type ===
    'OVERDUE' ? (
      <Clock3
        size={15}
      />
    ) : (
      <CalendarDays
        size={15}
      />
    );

  const iconStyle =
    item.type ===
    'OVERDUE'
      ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
      : item.type ===
          'TODAY'
        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
        : item.type ===
            'TOMORROW'
          ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
    >
      <div
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',

          iconStyle,
        ].join(' ')}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
          {item.title}
        </p>

        <p
          className={[
            'mt-1 text-xs',

            item.type ===
            'OVERDUE'
              ? 'font-medium text-red-600 dark:text-red-400'
              : 'text-slate-400 dark:text-slate-500',
          ].join(' ')}
        >
          {
            item.description
          }
        </p>
      </div>
    </button>
  );
}

function notificationWeight(
  type:
    NotificationItem['type'],
) {
  if (
    type ===
    'OVERDUE'
  ) {
    return 1;
  }

  if (
    type ===
    'TODAY'
  ) {
    return 2;
  }

  if (
    type ===
    'TOMORROW'
  ) {
    return 3;
  }

  return 4;
}

function formatDate(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleDateString(
    'en-GB',
    {
      day:
        '2-digit',

      month:
        'short',

      year:
        'numeric',
    },
  );
}