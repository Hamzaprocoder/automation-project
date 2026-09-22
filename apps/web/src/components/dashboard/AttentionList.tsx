interface AttentionItem {
  type: string;
  message: string;
  count: number;
  severity: "high" | "medium" | "low";
}

interface AttentionListProps {
  items: AttentionItem[];
}

const severityStyles = {
  high: "border-red-200 bg-red-50 text-red-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

export default function AttentionList({ items }: AttentionListProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Attention Required</h2>
        <p className="mt-1 text-sm text-zinc-500">Items that may need action from your team.</p>
      </div>

      {!items.length ? (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Everything looks good right now.
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item.type}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${severityStyles[item.severity]}`}
            >
              <span className="min-w-7 text-base font-bold">{item.count}</span>
              <span className="leading-6">{item.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
