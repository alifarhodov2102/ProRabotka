'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  ListTodo,
  Plus,
  Search,
  UserRound,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import AppShell from '@/components/app-shell';
import ConfirmModal from '@/components/ui/confirm-modal';

import TaskBoard from '@/components/tasks/task-board';

import TaskModal, {
  TaskFormValue,
} from '@/components/tasks/task-modal';

import TaskDetailDrawer from '@/components/tasks/task-detail-drawer';

import {
  TaskItem,
  TaskUser,
} from '@/components/tasks/task-card';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE';

type TaskScope =
  | 'ALL'
  | 'MINE';

type StoredUser = {
  id?: string;
  name?: string;
};

const emptyForm: TaskFormValue = {
  title: '',
  description: '',
  assigneeId: '',
  priority: 'MEDIUM',
  status: 'TODO',
  dueDate: '',
};

export default function DashboardPage() {
  const router =
    useRouter();

  const [
    tasks,
    setTasks,
  ] =
    useState<TaskItem[]>(
      [],
    );

  const [
    users,
    setUsers,
  ] =
    useState<TaskUser[]>(
      [],
    );

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState<
    string | undefined
  >(undefined);

  const [
    taskScope,
    setTaskScope,
  ] =
    useState<TaskScope>(
      'ALL',
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    assigneeFilter,
    setAssigneeFilter,
  ] =
    useState('ALL');

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);

  const [
    editingTask,
    setEditingTask,
  ] =
    useState<TaskItem | null>(
      null,
    );

  const [
    detailTaskId,
    setDetailTaskId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<TaskFormValue>(
      emptyForm,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    draggedTask,
    setDraggedTask,
  ] =
    useState<TaskItem | null>(
      null,
    );

  const [
    deleteTask,
    setDeleteTask,
  ] =
    useState<TaskItem | null>(
      null,
    );

  const [
    deleteLoading,
    setDeleteLoading,
  ] =
    useState(false);

  useEffect(() => {
    const stored =
      localStorage.getItem(
        'prorabotka_user',
      );

    if (!stored) {
      return;
    }

    try {
      const user: StoredUser =
        JSON.parse(
          stored,
        );

      setCurrentUserId(
        user.id,
      );
    } catch {
      // Ignore invalid stored user
    }
  }, []);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location
          .search,
      );

    const taskId =
      params.get(
        'task',
      );

    if (
      taskId
    ) {
      setDetailTaskId(
        taskId,
      );
    }
  }, []);

  async function loadData() {
    try {
      setLoading(
        true,
      );

      setError('');

      const [
        tasksData,
        usersData,
      ] =
        await Promise.all([
          apiFetch<TaskItem[]>(
            '/tasks',
          ),

          apiFetch<TaskUser[]>(
            '/users',
          ),
        ]);

      setTasks(
        tasksData,
      );

      setUsers(
        usersData,
      );
    } catch (err) {
      if (
        err instanceof
          ApiError &&
        err.status !==
          401
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setLoading(
        false,
      );
    }
  }

  async function refreshTasks() {
    try {
      const tasksData =
        await apiFetch<
          TaskItem[]
        >(
          '/tasks',
        );

      setTasks(
        tasksData,
      );
    } catch (err) {
      if (
        err instanceof
          ApiError &&
        err.status !==
          401
      ) {
        setError(
          err.message,
        );
      }
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const scopedTasks =
    useMemo(() => {
      if (
        taskScope ===
        'MINE'
      ) {
        return tasks.filter(
          (task) =>
            task.assignee
              ?.id ===
            currentUserId,
        );
      }

      return tasks;
    }, [
      tasks,
      taskScope,
      currentUserId,
    ]);

  const filteredTasks =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      return scopedTasks.filter(
        (task) => {
          const matchesUser =
            assigneeFilter ===
              'ALL' ||
            task.assignee
              ?.id ===
              assigneeFilter;

          if (
            !matchesUser
          ) {
            return false;
          }

          if (!q) {
            return true;
          }

          return [
            task.title,
            task.description,
            task.assignee
              ?.name,
            task.creator
              ?.name,
            task.resident
              ?.companyName,
            task.startup
              ?.name,
            task.infrastructure
              ?.name,
          ]
            .filter(
              Boolean,
            )
            .some(
              (
                value,
              ) =>
                String(
                  value,
                )
                  .toLowerCase()
                  .includes(
                    q,
                  ),
            );
        },
      );
    }, [
      scopedTasks,
      search,
      assigneeFilter,
    ]);

  const todoCount =
    scopedTasks.filter(
      (task) =>
        task.status ===
        'TODO',
    ).length;

  const progressCount =
    scopedTasks.filter(
      (task) =>
        task.status ===
        'IN_PROGRESS',
    ).length;

  const doneCount =
    scopedTasks.filter(
      (task) =>
        task.status ===
        'DONE',
    ).length;

  const overdueCount =
    scopedTasks.filter(
      (task) => {
        if (
          !task.dueDate ||
          task.status ===
            'DONE'
        ) {
          return false;
        }

        return (
          new Date(
            task.dueDate,
          ).getTime() <
          new Date().setHours(
            0,
            0,
            0,
            0,
          )
        );
      },
    ).length;

  function selectScope(
    scope:
      TaskScope,
  ) {
    setTaskScope(
      scope,
    );

    if (
      scope ===
      'MINE'
    ) {
      setAssigneeFilter(
        'ALL',
      );
    }
  }

  function openCreate(
    status:
      TaskStatus =
      'TODO',
  ) {
    setEditingTask(
      null,
    );

    setForm({
      ...emptyForm,
      status,

      assigneeId:
        taskScope ===
          'MINE' &&
        currentUserId
          ? currentUserId
          : '',
    });

    setModalOpen(
      true,
    );
  }

  function openDetails(
    task:
      TaskItem,
  ) {
    setDetailTaskId(
      task.id,
    );

    router.replace(
      `/dashboard?task=${task.id}`,
      {
        scroll: false,
      },
    );
  }

  function closeDetails() {
    setDetailTaskId(
      null,
    );

    router.replace(
      '/dashboard',
      {
        scroll: false,
      },
    );
  }

  function openEdit(
    task:
      TaskItem,
  ) {
    setEditingTask(
      task,
    );

    setForm({
      title:
        task.title,

      description:
        task.description ||
        '',

      assigneeId:
        task.assignee
          ?.id ||
        '',

      priority:
        task.priority,

      status:
        task.status,

      dueDate:
        task.dueDate
          ? task.dueDate.slice(
              0,
              10,
            )
          : '',
    });

    setModalOpen(
      true,
    );
  }

  function closeModal() {
    if (
      saving
    ) {
      return;
    }

    setModalOpen(
      false,
    );

    setEditingTask(
      null,
    );

    setForm(
      emptyForm,
    );
  }

  async function saveTask() {
    if (
      !form.title.trim()
    ) {
      return;
    }

    try {
      setSaving(
        true,
      );

      setError('');

      const payload = {
        title:
          form.title.trim(),

        description:
          form.description.trim() ||
          undefined,

        assigneeId:
          form.assigneeId ||
          null,

        priority:
          form.priority,

        status:
          form.status,

        dueDate:
          form.dueDate ||
          null,
      };

      if (
        editingTask
      ) {
        await apiFetch(
          `/tasks/${editingTask.id}`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );
      } else {
        await apiFetch(
          '/tasks',
          {
            method:
              'POST',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );
      }

      setModalOpen(
        false,
      );

      setEditingTask(
        null,
      );

      setForm(
        emptyForm,
      );

      await refreshTasks();
    } catch (err) {
      if (
        err instanceof
        ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setSaving(
        false,
      );
    }
  }

  async function moveTask(
    task:
      TaskItem,

    status:
      TaskStatus,
  ) {
    const previousTasks =
      tasks;

    setTasks(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            task.id
              ? {
                  ...item,
                  status,
                }
              : item,
        ),
    );

    setDraggedTask(
      null,
    );

    try {
      await apiFetch(
        `/tasks/${task.id}`,
        {
          method:
            'PATCH',

          body:
            JSON.stringify({
              status,
            }),
        },
      );
    } catch (err) {
      setTasks(
        previousTasks,
      );

      if (
        err instanceof
        ApiError
      ) {
        setError(
          err.message,
        );
      }
    }
  }

  async function handleDelete() {
    if (
      !deleteTask
    ) {
      return;
    }

    try {
      setDeleteLoading(
        true,
      );

      setError('');

      await apiFetch(
        `/tasks/${deleteTask.id}`,
        {
          method:
            'DELETE',
        },
      );

      const deletedId =
        deleteTask.id;

      setDeleteTask(
        null,
      );

      setTasks(
        (current) =>
          current.filter(
            (task) =>
              task.id !==
              deletedId,
          ),
      );

      if (
        detailTaskId ===
        deletedId
      ) {
        closeDetails();
      }
    } catch (err) {
      if (
        err instanceof
        ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setDeleteLoading(
        false,
      );
    }
  }

  return (
    <AppShell>
      <div className="min-w-0 space-y-5 sm:space-y-7">
        <section className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 sm:text-sm">
              Workspace
            </p>

            <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
              Dashboard
            </h1>

            <p className="mt-1 max-w-xl text-sm leading-5 text-slate-500 dark:text-slate-400">
              Assign tasks and keep
              track of the
              team&apos;s work.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              openCreate()
            }
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition active:scale-[0.99] hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white sm:h-10 sm:w-auto sm:rounded-lg"
          >
            <Plus
              size={
                17
              }
            />

            New task
          </button>
        </section>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <section className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          <SummaryCard
            label="To do"
            value={
              todoCount
            }
            icon={
              <ListTodo
                size={
                  17
                }
              />
            }
          />

          <SummaryCard
            label="In progress"
            value={
              progressCount
            }
            icon={
              <Clock3
                size={
                  17
                }
              />
            }
          />

          <SummaryCard
            label="Done"
            value={
              doneCount
            }
            icon={
              <CheckCircle2
                size={
                  17
                }
              />
            }
          />

          <SummaryCard
            label="Overdue"
            value={
              overdueCount
            }
            icon={
              <Clock3
                size={
                  17
                }
              />
            }
            danger={
              overdueCount >
              0
            }
          />
        </section>

        <section className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1.5 transition-colors dark:border-slate-800 dark:bg-slate-900 sm:flex sm:w-fit">
          <button
            type="button"
            onClick={() =>
              selectScope(
                'ALL',
              )
            }
            className={[
              'min-w-0 rounded-lg px-3 py-2.5 text-sm font-medium transition sm:px-4 sm:py-2',

              taskScope ===
              'ALL'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            ].join(
              ' ',
            )}
          >
            All tasks
          </button>

          <button
            type="button"
            onClick={() =>
              selectScope(
                'MINE',
              )
            }
            className={[
              'min-w-0 rounded-lg px-3 py-2.5 text-sm font-medium transition sm:px-4 sm:py-2',

              taskScope ===
              'MINE'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            ].join(
              ' ',
            )}
          >
            My tasks
          </button>
        </section>

        <section className="grid min-w-0 gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 transition-colors dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
          <div className="flex h-11 min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 transition-colors dark:bg-slate-800 sm:h-10 sm:max-w-md sm:rounded-lg">
            <Search
              size={
                17
              }
              className="shrink-0 text-slate-400 dark:text-slate-500"
            />

            <input
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search tasks..."
              className="min-w-0 flex-1 bg-transparent text-[16px] text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500 sm:text-sm"
            />
          </div>

          <div className="relative min-w-0">
            <UserRound
              size={
                15
              }
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />

            <select
              value={
                assigneeFilter
              }
              disabled={
                taskScope ===
                'MINE'
              }
              onChange={(
                event,
              ) =>
                setAssigneeFilter(
                  event.target
                    .value,
                )
              }
              className={[
                'h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-[16px] text-slate-700 outline-none transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:h-10 sm:rounded-lg sm:text-sm',

                taskScope ===
                'MINE'
                  ? 'cursor-not-allowed opacity-50'
                  : 'focus:border-slate-300 dark:focus:border-slate-600',
              ].join(
                ' ',
              )}
            >
              <option value="ALL">
                {taskScope ===
                'MINE'
                  ? 'My tasks'
                  : 'All team members'}
              </option>

              {users.map(
                (
                  user,
                ) => (
                  <option
                    key={
                      user.id
                    }
                    value={
                      user.id
                    }
                  >
                    {
                      user.name
                    }
                  </option>
                ),
              )}
            </select>

            <ChevronDown
              size={
                15
              }
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </section>

        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400 dark:text-slate-500 sm:py-24">
            Loading tasks...
          </div>
        ) : (
          <TaskBoard
            tasks={
              filteredTasks
            }
            draggedTask={
              draggedTask
            }
            onCreate={
              openCreate
            }
            onOpen={
              openDetails
            }
            onEdit={
              openEdit
            }
            onDelete={
              setDeleteTask
            }
            onDragStart={
              setDraggedTask
            }
            onMove={
              moveTask
            }
          />
        )}

        <TaskModal
          open={
            modalOpen
          }
          editingTask={
            editingTask
          }
          value={
            form
          }
          users={
            users
          }
          saving={
            saving
          }
          onChange={
            setForm
          }
          onClose={
            closeModal
          }
          onSave={
            saveTask
          }
        />

        <TaskDetailDrawer
          taskId={
            detailTaskId
          }
          currentUserId={
            currentUserId
          }
          onClose={
            closeDetails
          }
          onEdit={
            openEdit
          }
          onDelete={
            setDeleteTask
          }
          onTaskChanged={
            refreshTasks
          }
        />

        <ConfirmModal
          open={
            deleteTask !==
            null
          }
          variant="delete"
          loading={
            deleteLoading
          }
          title="Delete task?"
          description={`${
            deleteTask?.title ??
            ''
          } will be permanently deleted. This action cannot be undone.`}
          confirmText="Delete task"
          onClose={() => {
            if (
              !deleteLoading
            ) {
              setDeleteTask(
                null,
              );
            }
          }}
          onConfirm={
            handleDelete
          }
        />
      </div>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  danger = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
            {label}
          </p>

          <p
            className={[
              'mt-2 text-2xl font-semibold tracking-tight sm:text-3xl',

              danger
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-900 dark:text-slate-100',
            ].join(
              ' ',
            )}
          >
            {value}
          </p>
        </div>

        <div
          className={[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9',

            danger
              ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
          ].join(
            ' ',
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}