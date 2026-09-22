interface Customer {
  id: string;
  name: string | null;
  phone: string;
  source: string | null;
  createdAt: string;
  lastInteractionAt: string | null;
}

interface RecentCustomersProps {
  customers: Customer[];
}

export default function RecentCustomers({ customers }: RecentCustomersProps) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Recent Customers</h2>
        <p className="mt-1 text-sm text-zinc-500">The latest customers added to your workspace.</p>
      </div>

      {customers.length === 0 ? (
        <p className="mt-5 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500">
          No customers yet. They will appear here once created.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-100">
          {customers.map((customer) => (
            <li key={customer.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {customer.name || "Unknown customer"}
                </p>
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {customer.phone}
                  {customer.source ? ` · ${customer.source}` : ""}
                </p>
              </div>
              <p className="shrink-0 text-xs text-zinc-500">
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
