type Startup = {
  status: string;
};

export default function StartupOverview({
  startups,
}: {
  startups: Startup[];
}) {
  const active =
    startups.filter(
      (s) =>
        s.status ===
        'ACTIVE',
    ).length;

  const paused =
    startups.filter(
      (s) =>
        s.status ===
        'PAUSED',
    ).length;

  const completed =
    startups.filter(
      (s) =>
        s.status ===
        'COMPLETED',
    ).length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card
        label="Total startups"
        value={
          startups.length
        }
        note="All startup records"
      />

      <Card
        label="Active"
        value={active}
        note="Currently active"
      />

      <Card
        label="Paused"
        value={paused}
        note="Need follow-up"
      />

      <Card
        label="Completed"
        value={
          completed
        }
        note="Completed startups"
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