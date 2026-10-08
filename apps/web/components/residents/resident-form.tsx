'use client';

type ResidentFormValue = {
  companyName: string;
  tin: string;
  activity: string;
  exporter: boolean;
  founderCountry: string;
  region: string;
  district: string;
  residentSince: string;
  focalPoint: string;
  broughtBy: string;
  status: string;
  notes: string;
};

export default function ResidentForm({
  value,
  onChange,
}: {
  value: ResidentFormValue;

  onChange: (
    value: ResidentFormValue,
  ) => void;
}) {
  function update<
    K extends keyof ResidentFormValue,
  >(
    key: K,
    next:
      ResidentFormValue[K],
  ) {
    onChange({
      ...value,
      [key]: next,
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field
        label="Company name"
        value={
          value.companyName
        }
        onChange={(v) =>
          update(
            'companyName',
            v,
          )
        }
      />

      <Field
        label="STIR"
        value={value.tin}
        onChange={(v) =>
          update(
            'tin',
            v,
          )
        }
      />

      <Field
        label="Activity"
        value={
          value.activity
        }
        onChange={(v) =>
          update(
            'activity',
            v,
          )
        }
      />

      <Field
        label="Founder country"
        value={
          value.founderCountry
        }
        onChange={(v) =>
          update(
            'founderCountry',
            v,
          )
        }
      />

      <Field
        label="Region"
        value={
          value.region
        }
        onChange={(v) =>
          update(
            'region',
            v,
          )
        }
      />

      <Field
        label="District"
        value={
          value.district
        }
        onChange={(v) =>
          update(
            'district',
            v,
          )
        }
      />

      <Field
        label="Resident since"
        type="date"
        value={
          value.residentSince
        }
        onChange={(v) =>
          update(
            'residentSince',
            v,
          )
        }
      />

      <Field
        label="Focal point"
        value={
          value.focalPoint
        }
        onChange={(v) =>
          update(
            'focalPoint',
            v,
          )
        }
      />

      <Field
        label="Brought by"
        value={
          value.broughtBy
        }
        onChange={(v) =>
          update(
            'broughtBy',
            v,
          )
        }
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Status
        </label>

        <select
          value={
            value.status
          }
          onChange={(
            event,
          ) =>
            update(
              'status',
              event.target
                .value,
            )
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
        >
          <option value="ACTIVE">
            Active
          </option>

          <option value="INACTIVE">
            Inactive
          </option>

          <option value="SUSPENDED">
            Suspended
          </option>

          <option value="ARCHIVED">
            Archived
          </option>
        </select>
      </div>

      <label className="flex items-center gap-3 pt-7 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={
            value.exporter
          }
          onChange={(
            event,
          ) =>
            update(
              'exporter',
              event.target
                .checked,
            )
          }
          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-950"
        />

        Exporter
      </label>

      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Notes
        </label>

        <textarea
          rows={4}
          value={
            value.notes
          }
          onChange={(
            event,
          ) =>
            update(
              'notes',
              event.target
                .value,
            )
          }
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
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value,
          )
        }
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
      />
    </div>
  );
}