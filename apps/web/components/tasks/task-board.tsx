'use client';

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
  description: string;
}[] = [
  {
    status: 'TODO',
    label: 'To do',
    description:
      'Waiting to start',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In progress',
    description:
      'Currently being worked on',
  },
  {
    status: 'DONE',
    label: 'Done',
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
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
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
              className="flex min-h-[520px] flex-col rounded-2xl bg-slate-100/80 p-3 transition-colors dark:bg-slate-900/70"
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <div className="flex items-center gap-2.5">
                  <ColumnIcon
                    status={
                      column.status
                    }
                  />

                  <div>
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

                    <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <Plus size={15} />
                </button>
              </div>

              <div className="space-y-3">
                {columnTasks.map(
                  (task) => (
                    <TaskCard
                      key={
                        task.id
                      }
                      task={task}
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
  );
}

function ColumnIcon({
  status,
}: {
  status: TaskStatus;
}) {
  if (status === 'DONE') {
    return (
      <CircleCheck
        size={17}
        className="text-emerald-600 dark:text-emerald-400"
      />
    );
  }

  if (
    status === 'IN_PROGRESS'
  ) {
    return (
      <Clock3
        size={17}
        className="text-amber-600 dark:text-amber-400"
      />
    );
  }

  return (
    <Circle
      size={17}
      className="text-slate-400 dark:text-slate-500"
    />
  );
}