'use client';

export type InfrastructureFormValue = {
  name: string;
  type:
    | 'ROOM'
    | 'EQUIPMENT';

  status: string;

  roomNumber: string;
  inventoryNo: string;
  location: string;

  quantity: string;
  capacity: string;

  residentId: string;
  description: string;
};

type ResidentOption = {
  id: string;
  companyName: string;
};

export default function InfrastructureForm({
  value,
  residents,
  onChange,
}: {
  value:
    InfrastructureFormValue;

  residents:
    ResidentOption[];

  onChange: (
    value: InfrastructureFormValue,
  ) => void;
}) {
  function update<
    K extends keyof InfrastructureFormValue,
  >(
    key: K,
    next:
      InfrastructureFormValue[K],
  ) {
    onChange({
      ...value,
      [key]: next,
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field
        label={
          value.type ===
          'ROOM'
            ? 'Room name'
            : 'Equipment name'
        }
        value={value.name}
        onChange={(v) =>
          update(
            'name',
            v,
          )
        }
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Type
        </label>

        <select
          value={value.type}
          onChange={(e) =>
            update(
              'type',
              e.target
                .value as
                | 'ROOM'
                | 'EQUIPMENT',
            )
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
        >
          <option value="ROOM">
            Room
          </option>

          <option value="EQUIPMENT">
            Equipment
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
          <option value="AVAILABLE">
            Available
          </option>

          <option value="IN_USE">
            In use
          </option>

          <option value="REPAIR">
            Repair
          </option>

          <option value="BROKEN">
            Broken
          </option>

          <option value="WRITTEN_OFF">
            Written off
          </option>
        </select>
      </div>

      {value.type ===
      'ROOM' ? (
        <>
          <Field
            label="Room number"
            value={
              value.roomNumber
            }
            onChange={(v) =>
              update(
                'roomNumber',
                v,
              )
            }
          />

          <Field
            label="Capacity"
            type="number"
            value={
              value.capacity
            }
            onChange={(v) =>
              update(
                'capacity',
                v,
              )
            }
          />
        </>
      ) : (
        <>
          <Field
            label="Inventory number"
            value={
              value.inventoryNo
            }
            onChange={(v) =>
              update(
                'inventoryNo',
                v,
              )
            }
          />

          <Field
            label="Quantity"
            type="number"
            value={
              value.quantity
            }
            onChange={(v) =>
              update(
                'quantity',
                v,
              )
            }
          />
        </>
      )}

      <Field
        label="Location"
        value={
          value.location
        }
        onChange={(v) =>
          update(
            'location',
            v,
          )
        }
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Assigned resident
        </label>

        <select
          value={
            value.residentId
          }
          onChange={(e) =>
            update(
              'residentId',
              e.target.value,
            )
          }
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500"
        >
          <option value="">
            Not assigned
          </option>

          {residents.map(
            (resident) => (
              <option
                key={
                  resident.id
                }
                value={
                  resident.id
                }
              >
                {
                  resident.companyName
                }
              </option>
            ),
          )}
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description / notes
        </label>

        <textarea
          rows={4}
          value={
            value.description
          }
          onChange={(e) =>
            update(
              'description',
              e.target.value,
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
        onChange={(e) =>
          onChange(
            e.target.value,
          )
        }
        min={
          type === 'number'
            ? 0
            : undefined
        }
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
      />
    </div>
  );
}