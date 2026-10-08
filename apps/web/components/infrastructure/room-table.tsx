'use client';

import {
  Pencil,
  Trash2,
} from 'lucide-react';

export type InfrastructureItem = {
  id: string;
  name: string;

  type:
    | 'ROOM'
    | 'EQUIPMENT';

  status: string;

  roomNumber?:
    | string
    | null;

  inventoryNo?:
    | string
    | null;

  description?:
    | string
    | null;

  location?:
    | string
    | null;

  quantity: number;

  capacity?:
    | number
    | null;

  residentId?:
    | string
    | null;

  resident?: {
    id: string;
    companyName: string;
  } | null;
};

export default function RoomTable({
  rooms,
  onEdit,
  onDelete,
}: {
  rooms:
    InfrastructureItem[];

  onEdit: (
    room: InfrastructureItem,
  ) => void;

  onDelete: (
    room: InfrastructureItem,
  ) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[70px_1.6fr_1fr_1.2fr_2fr_1fr_110px] bg-[#356b5a] px-4 py-3.5 text-[12px] font-semibold text-white dark:bg-[#284f43]">
            <div className="text-center">
              T/r
            </div>

            <div>
              Room
            </div>

            <div>
              Location
            </div>

            <div>
              Status
            </div>

            <div>
              Resident
            </div>

            <div>
              Capacity
            </div>

            <div />
          </div>

          {rooms.length ===
          0 ? (
            <div className="py-14 text-center text-sm text-slate-400 dark:text-slate-500">
              Rooms not found.
            </div>
          ) : (
            rooms.map(
              (
                room,
                index,
              ) => (
                <div
                  key={room.id}
                  className={[
                    'grid grid-cols-[70px_1.6fr_1fr_1.2fr_2fr_1fr_110px] items-center px-4 py-3.5 text-sm transition-colors',

                    index % 2 ===
                    0
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-slate-50/70 dark:bg-slate-950/40',

                    'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',
                  ].join(' ')}
                >
                  <div className="text-center text-slate-400 dark:text-slate-500">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {
                        room.name
                      }
                    </p>

                    {room.roomNumber && (
                      <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                        №{' '}
                        {
                          room.roomNumber
                        }
                      </p>
                    )}
                  </div>

                  <div className="text-slate-500 dark:text-slate-400">
                    {room.location ||
                      '—'}
                  </div>

                  <div>
                    <InfrastructureStatus
                      status={
                        room.status
                      }
                    />
                  </div>

                  <div className="truncate text-slate-600 dark:text-slate-300">
                    {room.resident
                      ?.companyName ||
                      '—'}
                  </div>

                  <div className="text-slate-500 dark:text-slate-400">
                    {room.capacity ??
                      '—'}
                  </div>

                  <Actions
                    item={room}
                    onEdit={
                      onEdit
                    }
                    onDelete={
                      onDelete
                    }
                  />
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Actions({
  item,
  onEdit,
  onDelete,
}: {
  item:
    InfrastructureItem;

  onEdit: (
    item: InfrastructureItem,
  ) => void;

  onDelete: (
    item: InfrastructureItem,
  ) => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() =>
          onEdit(item)
        }
        title="Edit"
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <Pencil
          size={14}
        />
      </button>

      <button
        type="button"
        onClick={() =>
          onDelete(item)
        }
        title="Delete"
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        <Trash2
          size={14}
        />
      </button>
    </div>
  );
}

export function InfrastructureStatus({
  status,
}: {
  status: string;
}) {
  const style:
    Record<
      string,
      string
    > = {
    AVAILABLE:
      'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/50',

    IN_USE:
      'bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:ring-sky-900/50',

    REPAIR:
      'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/50',

    BROKEN:
      'bg-red-100 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900/50',

    WRITTEN_OFF:
      'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
  };

  const labels:
    Record<
      string,
      string
    > = {
    AVAILABLE:
      'Available',

    IN_USE:
      'In use',

    REPAIR:
      'Repair',

    BROKEN:
      'Broken',

    WRITTEN_OFF:
      'Written off',
  };

  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',

        style[status] ??
          'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
      ].join(' ')}
    >
      {labels[status] ??
        status}
    </span>
  );
}