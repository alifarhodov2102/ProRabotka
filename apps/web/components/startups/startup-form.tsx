'use client';

export type StartupFormValue = {
  name: string;
  founderName: string;
  phone: string;
  email: string;
  stage: string;
  status: string;
  joinedAt: string;
  notes: string;
};

export default function StartupForm({
  value,
  onChange,
}: {
  value: StartupFormValue;
  onChange: (
    value: StartupFormValue,
  ) => void;
}) {
  function update<
    K extends keyof StartupFormValue,
  >(
    key: K,
    next: StartupFormValue[K],
  ) {
    onChange({
      ...value,
      [key]: next,
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field
        label="Startup name"
        value={value.name}
        onChange={(v) =>
          update('name', v)
        }
      />

      <Field
        label="Founder"
        value={value.founderName}
        onChange={(v) =>
          update('founderName', v)
        }
      />

      <Field
        label="Phone"
        value={value.phone}
        onChange={(v) =>
          update('phone', v)
        }
      />

      <Field
        label="Email"
        type="email"
        value={value.email}
        onChange={(v) =>
          update('email', v)
        }
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Stage
        </label>

        <select
          value={value.stage}
          onChange={(e) =>
            update(
              'stage',
              e.target.value,
            )
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
        >
          <option value="">
            Select stage
          </option>

          <option value="Idea">
            Idea
          </option>

          <option value="Validation">
            Validation
          </option>

          <option value="MVP">
            MVP
          </option>

          <option value="Growth">
            Growth
          </option>

          <option value="Scaling">
            Scaling
          </option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Status
        </label>

        <select
          value={value.status}
          onChange={(e) =>
            update(
              'status',
              e.target.value,
            )
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
        >
          <option value="ACTIVE">
            Active
          </option>

          <option value="PAUSED">
            Paused
          </option>

          <option value="COMPLETED">
            Completed
          </option>

          <option value="ARCHIVED">
            Archived
          </option>
        </select>
      </div>

      <Field
        label="Joined date"
        type="date"
        value={value.joinedAt}
        onChange={(v) =>
          update('joinedAt', v)
        }
      />

      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Notes
        </label>

        <textarea
          value={value.notes}
          onChange={(e) =>
            update(
              'notes',
              e.target.value,
            )
          }
          rows={4}
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;

  onChange: (
    value: string,
  ) => void;

  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value,
          )
        }
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
      />
    </div>
  );
}