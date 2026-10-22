'use client';

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

import {
  TaskItem,
  TaskUser,
} from './task-card';

type TaskComment = {
  id: string;
  content: string;
  createdAt: string;
  user: TaskUser;
};

type TaskActivity = {
  id: string;
  action: string;
  description?: string | null;
  createdAt: string;
  user: TaskUser;
};

export type TaskDetails =
  TaskItem & {
    comments: TaskComment[];

    attachments: {
      id: string;
      fileName: string;
      fileUrl: string;
      fileSize?:
        | number
        | null;
      createdAt: string;
    }[];

    activities:
      TaskActivity[];
  };

export default function TaskDetailDrawer({
  taskId,
  currentUserId,
  onClose,
  onEdit,
  onDelete,
  onTaskChanged,
}: {
  taskId: string | null;

  currentUserId?: string;

  onClose: () => void;

  onEdit: (
    task: TaskItem,
  ) => void;

  onDelete: (
    task: TaskItem,
  ) => void;

  onTaskChanged:
    () => void;
}) {
  const [task, setTask] =
    useState<TaskDetails | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [error, setError] =
    useState('');

  const [
    comment,
    setComment,
  ] = useState('');

  const [
    sendingComment,
    setSendingComment,
  ] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setTask(null);
      return;
    }

    loadTask(taskId);
  }, [taskId]);

  async function loadTask(
    id: string,
  ) {
    try {
      setLoading(true);
      setError('');

      const data =
        await apiFetch<TaskDetails>(
          `/tasks/${id}`,
        );

      setTask(data);
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendComment() {
    if (
      !taskId ||
      !comment.trim()
    ) {
      return;
    }

    try {
      setSendingComment(
        true,
      );
      setError('');

      await apiFetch(
        `/tasks/${taskId}/comments`,
        {
          method: 'POST',

          body:
            JSON.stringify({
              content:
                comment.trim(),
            }),
        },
      );

      setComment('');

      await loadTask(
        taskId,
      );

      await onTaskChanged();
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setSendingComment(
        false,
      );
    }
  }

  async function deleteComment(
    commentId: string,
  ) {
    if (!taskId) {
      return;
    }

    try {
      setError('');

      await apiFetch(
        `/tasks/${taskId}/comments/${commentId}`,
        {
          method:
            'DELETE',
        },
      );

      await loadTask(
        taskId,
      );

      await onTaskChanged();
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        setError(
          err.message,
        );
      }
    }
  }

  if (!taskId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/25 backdrop-blur-[1px] dark:bg-black/60"
        aria-label="Close task details"
      />

      <aside className="absolute bottom-0 right-0 top-0 flex w-full max-w-[680px] flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            Loading task...
          </div>
        ) : !task ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {error ||
                  'Task not found.'}
              </p>

              <button
                type="button"
                onClick={
                  onClose
                }
                className="mt-4 text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-7">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge
                    priority={
                      task.priority
                    }
                  />

                  <StatusBadge
                    status={
                      task.status
                    }
                  />
                </div>

                <h2 className="mt-3 text-xl font-semibold leading-7 text-slate-900 dark:text-slate-100">
                  {task.title}
                </h2>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onEdit(task);
                    onClose();
                  }}
                  title="Edit task"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <Pencil
                    size={16}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDelete(task);
                    onClose();
                  }}
                  title="Delete task"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                >
                  <Trash2
                    size={16}
                  />
                </button>

                <button
                  type="button"
                  onClick={
                    onClose
                  }
                  title="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-7 px-5 py-6 sm:px-7">
                {error && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                  </div>
                )}

                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                    Description
                  </h3>

                  {task.description ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {
                        task.description
                      }
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
                      No description.
                    </p>
                  )}
                </section>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <AssigneesInfoCard
                    assignees={
                      task.assignees
                    }
                  />

                  <InfoCard
                    icon={
                      <CalendarDays
                        size={16}
                      />
                    }
                    label="Due date"
                    value={
                      task.dueDate
                        ? formatDate(
                            task.dueDate,
                          )
                        : 'No due date'
                    }
                  />

                  <InfoCard
                    icon={
                      <UserRound
                        size={16}
                      />
                    }
                    label="Created by"
                    value={
                      task.creator
                        .name
                    }
                    secondary={
                      formatDateTime(
                        task.createdAt,
                      )
                    }
                  />

                  <InfoCard
                    icon={
                      <Clock3
                        size={16}
                      />
                    }
                    label="Updated"
                    value={
                      formatRelative(
                        task.updatedAt,
                      )
                    }
                    secondary={
                      formatDateTime(
                        task.updatedAt,
                      )
                    }
                  />
                </section>

                {(task.resident ||
                  task.startup ||
                  task.infrastructure) && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                      Related to
                    </h3>

                    <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-400">
                      {task.resident
                        ?.companyName ||
                        task.startup
                          ?.name ||
                        task.infrastructure
                          ?.name}
                    </div>
                  </section>
                )}

                <section>
                  <div className="flex items-center gap-2">
                    <History
                      size={16}
                      className="text-slate-400 dark:text-slate-500"
                    />

                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Activity
                    </h3>
                  </div>

                  <div className="mt-4 space-y-4">
                    {task.activities
                      .length ===
                    0 ? (
                      <p className="text-sm text-slate-400 dark:text-slate-500">
                        No activity
                        yet.
                      </p>
                    ) : (
                      task.activities.map(
                        (
                          activity,
                        ) => (
                          <ActivityRow
                            key={
                              activity.id
                            }
                            activity={
                              activity
                            }
                          />
                        ),
                      )
                    )}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2">
                    <MessageSquare
                      size={16}
                      className="text-slate-400 dark:text-slate-500"
                    />

                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Comments
                    </h3>

                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {
                        task.comments
                          .length
                      }
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    {task.comments
                      .length ===
                      0 && (
                      <p className="text-sm text-slate-400 dark:text-slate-500">
                        No comments
                        yet.
                      </p>
                    )}

                    {task.comments.map(
                      (item) => (
                        <CommentRow
                          key={
                            item.id
                          }
                          comment={
                            item
                          }
                          canDelete={
                            item.user
                              .id ===
                            currentUserId
                          }
                          onDelete={() =>
                            deleteComment(
                              item.id,
                            )
                          }
                        />
                      ),
                    )}
                  </div>
                </section>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:px-7 sm:py-5">
              <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-slate-300 focus-within:bg-white dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-slate-600 dark:focus-within:bg-slate-950">
                <textarea
                  rows={2}
                  value={
                    comment
                  }
                  onChange={(
                    event,
                  ) =>
                    setComment(
                      event.target
                        .value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                        'Enter' &&
                      (event.metaKey ||
                        event.ctrlKey)
                    ) {
                      event.preventDefault();
                      sendComment();
                    }
                  }}
                  placeholder="Write a comment..."
                  className="min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />

                <button
                  type="button"
                  disabled={
                    sendingComment ||
                    !comment.trim()
                  }
                  onClick={
                    sendComment
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  title="Send comment"
                >
                  <Send
                    size={16}
                  />
                </button>
              </div>

              <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                Ctrl/⌘ + Enter to
                send
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function AssigneesInfoCard({
  assignees,
}: {
  assignees: TaskUser[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
        <UserRound
          size={16}
        />

        <span className="text-[11px] font-medium">
          Assigned to
        </span>
      </div>

      {assignees.length === 0 ? (
        <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
          Unassigned
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {assignees.map(
            (assignee) => (
              <div
                key={assignee.id}
                className="flex min-w-0 items-center gap-2.5"
              >
                <Avatar
                  name={assignee.name}
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                    {assignee.name}
                  </p>

                  {assignee.position && (
                    <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">
                      {assignee.position}
                    </p>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  secondary,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
        {icon}

        <span className="text-[11px] font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
        {value}
      </p>

      {secondary && (
        <p className="mt-1 truncate text-[11px] text-slate-400 dark:text-slate-500">
          {secondary}
        </p>
      )}
    </div>
  );
}

function ActivityRow({
  activity,
}: {
  activity: TaskActivity;
}) {
  return (
    <div className="flex gap-3">
      <Avatar
        name={
          activity.user.name
        }
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5 text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {
              activity.user
                .name
            }
          </span>{' '}
          {activity.description ||
            activity.action}
        </p>

        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
          {formatDateTime(
            activity.createdAt,
          )}
        </p>
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  canDelete,
  onDelete,
}: {
  comment: TaskComment;
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="group flex gap-3">
      <Avatar
        name={
          comment.user.name
        }
      />

      <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {
                comment.user
                  .name
              }
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
              {formatDateTime(
                comment.createdAt,
              )}
            </p>
          </div>

          {canDelete && (
            <button
              type="button"
              onClick={
                onDelete
              }
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              title="Delete comment"
            >
              <Trash2
                size={13}
              />
            </button>
          )}
        </div>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-700 dark:text-slate-300">
          {comment.content}
        </p>
      </div>
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
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white dark:bg-slate-700">
      {initials || '?'}
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
      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',

    MEDIUM:
      'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',

    HIGH:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',

    URGENT:
      'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  };

  return (
    <span
      className={[
        'rounded-md px-2 py-1 text-[10px] font-semibold',
        styles[priority],
      ].join(' ')}
    >
      {priority.charAt(0) +
        priority
          .slice(1)
          .toLowerCase()}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status:
    TaskItem['status'];
}) {
  if (status === 'DONE') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        <CheckCircle2
          size={11}
        />
        Done
      </span>
    );
  }

  if (
    status ===
    'IN_PROGRESS'
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
        <Clock3
          size={11}
        />
        In progress
      </span>
    );
  }

  return (
    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
      To do
    </span>
  );
}

function formatDate(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

function formatDateTime(
  value: string,
) {
  return new Date(
    value,
  ).toLocaleString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

function formatRelative(
  value: string,
) {
  const difference =
    Date.now() -
    new Date(
      value,
    ).getTime();

  const minutes =
    Math.floor(
      difference /
        60000,
    );

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `${hours} h ago`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  return `${days} d ago`;
}