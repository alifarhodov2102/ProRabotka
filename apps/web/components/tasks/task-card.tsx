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

  assignees: TaskUser[];

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
  draggable = true,
  onOpen,
  onEdit,
  onDelete,
  onDragStart,
}: {
  task: TaskItem;
  draggable?: boolean;

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
      draggable={
        draggable
      }
      onClick={() =>
        onOpen(
          task,
        )
      }
      onDragStart={() => {
        if (
          draggable
        ) {
          onDragStart(
            task,
          );
        }
      }}
      className={[
        'group min-w-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition sm:p-4 dark:border-slate-800 dark:bg-slate-950/70',

        draggable
          ? 'hover:border-slate-300 hover:shadow-md active:cursor-grabbing dark:hover:border-slate-700'
          : 'active:scale-[0.995]',
      ].join(' ')}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <PriorityBadge
          priority={
            task.priority
          }
        />

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(
              event,
            ) => {
              event.stopPropagation();

              onEdit(
                task,
              );
            }}
            title="Edit task"
            aria-label="Edit task"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Pencil
              size={14}
            />
          </button>

          <button
            type="button"
            onClick={(
              event,
            ) => {
              event.stopPropagation();

              onDelete(
                task,
              );
            }}
            title="Delete task"
            aria-label="Delete task"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 active:scale-95 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <Trash2
              size={14}
            />
          </button>
        </div>
      </div>

      <h3 className="mt-2.5 break-words text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 break-words text-xs leading-5 text-slate-500 dark:text-slate-400">
          {task.description}
        </p>
      )}

      <TaskContext
        task={task}
      />

      <div className="mt-4 flex min-w-0 flex-col gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          {task.assignees.length > 0 ? (
            <AssigneeSummary
              assignees={
                task.assignees
              }
            />
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <UserRound
                size={13}
              />

              Unassigned
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:justify-end">
          {(task._count
            ?.comments ??
            0) > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
              <MessageSquare
                size={12}
              />

              {task._count
                ?.comments}
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

function AssigneeSummary({
  assignees,
}: {
  assignees: TaskUser[];
}) {
  const visible =
    assignees.slice(
      0,
      3,
    );

  const remaining =
    assignees.length -
    visible.length;

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex shrink-0 items-center -space-x-2">
        {visible.map(
          (assignee) => (
            <Avatar
              key={
                assignee.id
              }
              name={
                assignee.name
              }
            />
          ),
        )}

        {remaining > 0 && (
          <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-semibold text-slate-600 dark:border-slate-950 dark:bg-slate-700 dark:text-slate-200">
            +{remaining}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">
          {assignees.length === 1
            ? assignees[0].name
            : `${assignees.length} assignees`}
        </p>

        {assignees.length === 1 &&
          assignees[0]
            .position && (
            <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
              {
                assignees[0]
                  .position
              }
            </p>
          )}
      </div>
    </div>
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
        styles[
          priority
        ],
      ].join(' ')}
    >
      {labels[
        priority
      ]}
    </span>
  );
}

function TaskContext({
  task,
}: {
  task: TaskItem;
}) {
  const text =
    task.resident
      ?.companyName ||
    task.startup
      ?.name ||
    task.infrastructure
      ?.name;

  if (!text) {
    return null;
  }

  return (
    <div className="mt-3 min-w-0">
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
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(
        0,
        2,
      )
      .map(
        (
          part,
        ) =>
          part
            .charAt(
              0,
            )
            .toUpperCase(),
      )
      .join('');

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[9px] font-semibold text-white dark:border-slate-950 dark:bg-slate-700">
      {initials ||
        '?'}
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
    new Date(
      dueDate,
    );

  const overdue =
    status !==
      'DONE' &&
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
          month:
            'short',
        },
      )}
    </div>
  );
}
