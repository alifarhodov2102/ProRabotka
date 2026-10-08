type Item = {
  type: string;
  status: string;
};

export default function InfrastructureOverview({
  items,
}: {
  items: Item[];
}) {
  const rooms =
    items.filter(
      (item) =>
        item.type ===
        'ROOM',
    );

  const equipment =
    items.filter(
      (item) =>
        item.type ===
        'EQUIPMENT',
    );

  const availableRooms =
    rooms.filter(
      (item) =>
        item.status ===
        'AVAILABLE',
    ).length;

  const attention =
    items.filter(
      (item) =>
        item.status ===
          'REPAIR' ||
        item.status ===
          'BROKEN',
    ).length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card
        label="Rooms"
        value={rooms.length}
        note="Total rooms"
      />

      <Card
        label="Available rooms"
        value={
          availableRooms
        }
        note="Ready for assignment"
      />

      <Card
        label="Equipment"
        value={
          equipment.length
        }
        note="Registered assets"
      />

      <Card
        label="Needs attention"
        value={attention}
        note="Repair or broken"
      />
    </div>
  );
}

function Card({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-colors dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>

      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        {note}
      </p>
    </div>
  );
}