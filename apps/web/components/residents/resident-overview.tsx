type Resident = {
  status: string;
  exporter: boolean;
};

export default function ResidentOverview({
  residents,
}: {
  residents: Resident[];
}) {
  const active =
    residents.filter(
      (resident) =>
        resident.status ===
        'ACTIVE',
    ).length;

  const exporters =
    residents.filter(
      (resident) =>
        resident.exporter,
    ).length;

  const archived =
    residents.filter(
      (resident) =>
        resident.status ===
        'ARCHIVED',
    ).length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card
        label="Total residents"
        value={
          residents.length
        }
        note="Stored in ProRabotka"
      />

      <Card
        label="Active residents"
        value={active}
        note="Current active companies"
      />

      <Card
        label="Exporters"
        value={
          exporters
        }
        note="Export-enabled residents"
      />

      <Card
        label="Archived"
        value={
          archived
        }
        note="No longer active"
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