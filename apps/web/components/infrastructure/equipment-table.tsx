'use client';

import {
  Pencil,
  Trash2,
} from 'lucide-react';

import {
  InfrastructureItem,
  InfrastructureStatus,
} from './room-table';

export default function EquipmentTable({
  equipment,
  onEdit,
  onDelete,
}: {
  equipment: InfrastructureItem[];

  onEdit: (
    item: InfrastructureItem,
  ) => void;

  onDelete: (
    item: InfrastructureItem,
  ) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[70px_2fr_1.3fr_1fr_1.2fr_1.5fr_1.8fr_110px] bg-[#356b5a] px-4 py-3.5 text-[12px] font-semibold text-white dark:bg-[#284f43]">
            <div className="text-center">
              T/r
            </div>

            <div>
              Equipment
            </div>

            <div>
              Inventory No.
            </div>

            <div>
              Quantity
            </div>

            <div>
              Status
            </div>

            <div>
              Location
            </div>

            <div>
              Assigned resident
            </div>

            <div />
          </div>

          {equipment.length ===
          0 ? (
            <div className="py-14 text-center text-sm text-slate-400 dark:text-slate-500">
              Equipment not found.
            </div>
          ) : (
            equipment.map(
              (
                item,
                index,
              ) => (
                <div
                  key={item.id}
                  className={[
                    'grid grid-cols-[70px_2fr_1.3fr_1fr_1.2fr_1.5fr_1.8fr_110px] items-center px-4 py-3.5 text-sm transition-colors',

                    index % 2 === 0
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-slate-50/70 dark:bg-slate-950/40',

                    'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20',
                  ].join(' ')}
                >
                  <div className="text-center text-slate-400 dark:text-slate-500">
                    {index + 1}
                  </div>

                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {item.name}
                  </div>

                  <div className="font-mono text-[13px] text-slate-500 dark:text-slate-400">
                    {item.inventoryNo ||
                      '—'}
                  </div>

                  <div className="text-slate-500 dark:text-slate-400">
                    {item.quantity}
                  </div>

                  <div>
                    <InfrastructureStatus
                      status={
                        item.status
                      }
                    />
                  </div>

                  <div className="text-slate-500 dark:text-slate-400">
                    {item.location ||
                      '—'}
                  </div>

                  <div className="truncate text-slate-600 dark:text-slate-300">
                    {item.resident
                      ?.companyName ||
                      '—'}
                  </div>

                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(item)
                      }
                      title="Edit equipment"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <Pencil
                        size={14}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(
                          item,
                        )
                      }
                      title="Delete equipment"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}