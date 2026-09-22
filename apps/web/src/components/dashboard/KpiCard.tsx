interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: string;
}

export default function KpiCard({ title, value, description, trend }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">{value}</p>
      {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
      {trend && <p className="mt-2 text-xs font-medium text-emerald-600">{trend}</p>}
    </div>
  );
}
