'use client';

import {
  useState,
} from 'react';

import {
  Circle,
  CircleCheck,
  Clock3,
  Plus,
} from 'lucide-react';

import TaskCard, {
  TaskItem,
} from './task-card';

type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE';

const columns: {
  status: TaskStatus;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    status: 'TODO',
    label: 'To do',
    shortLabel: 'To do',
    description:
      'Waiting to start',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In progress',
    shortLabel: 'Progress',
    description:
      'Currently being worked on',
  },
  {
    status: 'DONE',
    label: 'Done',
    shortLabel: 'Done',
    description:
      'Completed tasks',
  },
];

export default function TaskBoard({
  tasks,
  draggedTask,
  onCreate,
  onOpen,
  onEdit,
  onDelete,
  onDragStart,
  onMove,
}: {
  tasks: TaskItem[];

  draggedTask:
    | TaskItem
    | null;

  onCreate: (
    status: TaskStatus,
  ) => void;

  onOpen: (
    task: TaskItem,
  ) => void;

  onEdit: (
    task: TaskItem,
  ) => void;

  onDelete: (
    task: TaskItem,
  ) => void;

  onDragStart: (
    task: TaskItem,
  ) => void;

  onMove: (
    task: TaskItem,
    status: TaskStatus,
  ) => void;
}) {
  const [
    mobileStatus,
    setMobileStatus,
  ] =
    useState<TaskStatus>(
      'TODO',
    );

  const mobileColumn =
    columns.find(
      (column) =>
        column.status ===
        mobileStatus,
    ) ?? columns[0];

  const mobileTasks =
    tasks.filter(
      (task) =>
        task.status ===
        mobileStatus,
    );

  return (
    <>
      <div className="xl:hidden">
        <div className="mb-3 grid grid-cols-3 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          {columns.map(
            (column) => {
              const count =
                tasks.filter(
                  (task) =>
                    task.status ===
                    column.status,
                ).length;

              const active =
                mobileStatus ===
                column.status;

              return (
                <button
                  key={
                    column.status
                  }
                  type="button"
                  onClick={() =>
                    setMobileStatus(
                      column.status,
                    )
                  }
                  className={[
                    'flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition',

                    active
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800',
                  ].join(
                    ' ',
                  )}
                >
                  <span className="truncate">
                    {
                      column.shortLabel
                    }
                  </span>

                  <span
                    className={[
                      'flex min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[9px] font-semibold',

                      active
                        ? 'bg-white/15 text-white dark:bg-slate-900/10 dark:text-slate-900'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                    ].join(
                      ' ',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            },
          )}
        </div>

        <section className="overflow-hidden rounded-2xl bg-slate-100/80 p-3 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-3 px-1 pb-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <ColumnIcon
                status={
                  mobileColumn.status
                }
              />

              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {
                    mobileColumn.label
                  }
                </h2>

                <p className="mt-0.5 truncate text-[10px] text-slate-400 dark:text-slate-500">
                  {
                    mobileColumn.description
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onCreate(
                  mobileColumn.status,
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition active:scale-95 dark:bg-slate-800 dark:text-slate-300"
              aria-label="Add task"
            >
              <Plus
                size={
                  17
                }
              />
            </button>
          </div>

          <div className="space-y-3">
            {mobileTasks.map(
              (
                task,
              ) => (
                <TaskCard
                  key={
                    task.id
                  }
                  task={
                    task
                  }
                  draggable={
                    false
                  }
                  onOpen={
                    onOpen
                  }
                  onEdit={
                    onEdit
                  }
                  onDelete={
                    onDelete
                  }
                  onDragStart={
                    onDragStart
                  }
                />
              ),
            )}

            {mobileTasks.length ===
              0 && (
              <button
                type="button"
                onClick={() =>
                  onCreate(
                    mobileColumn.status,
                  )
                }
                className="flex min-h-[100px] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 text-xs font-medium text-slate-400 transition active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-500"
              >
                + Add task
              </button>
            )}
          </div>
        </section>
      </div>

      <div className="hidden grid-cols-3 gap-4 xl:grid">
        {columns.map(
          (column) => {
            const columnTasks =
              tasks.filter(
                (task) =>
                  task.status ===
                  column.status,
              );

            return (
              <section
                key={
                  column.status
                }
                onDragOver={(
                  event,
                ) =>
                  event.preventDefault()
                }
                onDrop={() => {
                  if (
                    draggedTask &&
                    draggedTask.status !==
                      column.status
                  ) {
                    onMove(
                      draggedTask,
                      column.status,
                    );
                  }
                }}
                className="flex min-h-[520px] min-w-0 flex-col rounded-2xl bg-slate-100/80 p-3 transition-colors dark:bg-slate-900/70"
              >
                <div className="flex items-center justify-between px-1 pb-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ColumnIcon
                      status={
                        column.status
                      }
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {
                            column.label
                          }
                        </h2>

                        <span className="flex min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {
                            columnTasks.length
                          }
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-[10px] text-slate-400 dark:text-slate-500">
                        {
                          column.description
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onCreate(
                        column.status,
                      )
                    }
                    title="Add task"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <Plus
                      size={
                        15
                      }
                    />
                  </button>
                </div>

                <div className="space-y-3">
                  {columnTasks.map(
                    (
                      task,
                    ) => (
                      <TaskCard
                        key={
                          task.id
                        }
                        task={
                          task
                        }
                        onOpen={
                          onOpen
                        }
                        onEdit={
                          onEdit
                        }
                        onDelete={
                          onDelete
                        }
                        onDragStart={
                          onDragStart
                        }
                      />
                    ),
                  )}

                  {columnTasks.length ===
                    0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onCreate(
                          column.status,
                        )
                      }
                      className="flex min-h-[110px] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/40 text-xs text-slate-400 transition hover:border-slate-400 hover:bg-white hover:text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-500 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    >
                      + Add task
                    </button>
                  )}
                </div>
              </section>
            );
          },
        )}
      </div>
    </>
  );
}

function ColumnIcon({
  status,
}: {
  status: TaskStatus;
}) {
  if (
    status ===
    'DONE'
  ) {
    return (
      <CircleCheck
        size={
          17
        }
        className="shrink-0 text-emerald-600 dark:text-emerald-400"
      />
    );
  }

  if (
    status ===
    'IN_PROGRESS'
  ) {
    return (
      <Clock3
        size={
          17
        }
        className="shrink-0 text-amber-600 dark:text-amber-400"
      />
    );
  }

  return (
    <Circle
      size={
        17
      }
      className="shrink-0 text-slate-400 dark:text-slate-500"
    />
  );
}