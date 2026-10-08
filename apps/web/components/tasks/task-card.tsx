'use client';

import {
  CalendarDays,
  MessageSquare,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';

export type TaskUser = {
  id: string;
  name: string;
  email?: string;
  position?: string | null;
};

export type TaskItem = {
  id: string;
  title: string;

  description?: string | null;

  status:
    | 'TODO'
    | 'IN_PROGRESS'
    | 'DONE';

  priority:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'URGENT';

  dueDate?: string | null;
  completedAt?: string | null;

  createdAt: string;
  updatedAt: string;

  creator: TaskUser;

  assignee?: TaskUser | null;

  startup?: {
    id: string;
    name: string;
  } | null;

  resident?: {
    id: string;
    companyName: string;
  } | null;

  infrastructure?: {
    id: string;
    name: string;
  } | null;

  _count?: {
    comments: number;
    attachments: number;
  };
};

export default function TaskCard({
  task,
  onOpen,
  onEdit,
  onDelete,
  onDragStart,
}: {
  task: TaskItem;

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
}) {
  return (
    <article
      draggable
      onClick={() =>
        onOpen(task)
      }
      onDragStart={() =>
        onDragStart(task)
      }
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md active:cursor-grabbing dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-slate-700"
    >
      <div className="flex items-start justify-between gap-3">
        <PriorityBadge
          priority={task.priority}
        />

        <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(task);
            }}
            title="Edit task"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil size={13} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(task);
            }}
            title="Delete task"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <h3 className="mt-3 text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {task.description}
        </p>
      )}

      <TaskContext task={task} />

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="min-w-0">
          {task.assignee ? (
            <div className="flex min-w-0 items-center gap-2">
              <Avatar
                name={
                  task.assignee.name
                }
              />

              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  {
                    task.assignee
                      .name
                  }
                </p>

                {task.assignee
                  .position && (
                  <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                    {
                      task.assignee
                        .position
                    }
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <UserRound
                size={13}
              />
              Unassigned
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {(task._count
            ?.comments ??
            0) > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
              <MessageSquare
                size={12}
              />

              {
                task._count
                  ?.comments
              }
            </div>
          )}

          {task.dueDate && (
            <DueDate
              dueDate={
                task.dueDate
              }
              status={
                task.status
              }
            />
          )}
        </div>
      </div>
    </article>
  );
}

function PriorityBadge({
  priority,
}: {
  priority:
    TaskItem['priority'];
}) {
  const styles = {
    LOW:
      'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',

    MEDIUM:
      'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',

    HIGH:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',

    URGENT:
      'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  };

  const labels = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
  };

  return (
    <span
      className={[
        'inline-flex rounded-md px-2 py-1 text-[10px] font-semibold',
        styles[priority],
      ].join(' ')}
    >
      {labels[priority]}
    </span>
  );
}

function TaskContext({
  task,
}: {
  task: TaskItem;
}) {
  const text =
    task.resident?.companyName ||
    task.startup?.name ||
    task.infrastructure?.name;

  if (!text) {
    return null;
  }

  return (
    <div className="mt-3">
      <span className="inline-flex max-w-full rounded-md bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
        <span className="truncate">
          {text}
        </span>
      </span>
    </div>
  );
}

function Avatar({
  name,
}: {
  name: string;
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part
        .charAt(0)
        .toUpperCase(),
    )
    .join('');

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[9px] font-semibold text-white dark:bg-slate-700">
      {initials || '?'}
    </div>
  );
}

function DueDate({
  dueDate,
  status,
}: {
  dueDate: string;
  status: string;
}) {
  const date =
    new Date(dueDate);

  const overdue =
    status !== 'DONE' &&
    date.getTime() <
      new Date().setHours(
        0,
        0,
        0,
        0,
      );

  return (
    <div
      className={[
        'flex shrink-0 items-center gap-1 text-[10px]',
        overdue
          ? 'font-medium text-red-600 dark:text-red-400'
          : 'text-slate-400 dark:text-slate-500',
      ].join(' ')}
    >
      <CalendarDays
        size={12}
      />

      {date.toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
        },
      )}
    </div>
  );
}