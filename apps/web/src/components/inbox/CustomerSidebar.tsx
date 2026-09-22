"use client";

import Link from "next/link";

export interface InboxCustomer {
  id: string;
  name: string | null;
  phone: string;
  whatsappNumber?: string | null;
  email?: string | null;
  source?: string | null;
  totalOrders?: number;
  totalSpent?: number;
  notes?: string | null;
}

export default function CustomerSidebar({ customer }: { customer: InboxCustomer | null }) {
  if (!customer) return <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-500">Select a conversation to see customer details</div>;
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-white">{(customer.name || customer.phone).charAt(0).toUpperCase()}</div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900">{customer.name || "Unknown Customer"}</h3>
      <p className="text-sm text-zinc-500">{customer.phone}</p>
      <div className="mt-6 space-y-4 text-sm">
        <div><p className="text-zinc-500">WhatsApp</p><p className="font-medium text-zinc-900">{customer.whatsappNumber || customer.phone}</p></div>
        {customer.email && <div><p className="text-zinc-500">Email</p><p className="break-words font-medium text-zinc-900">{customer.email}</p></div>}
        <div><p className="text-zinc-500">Source</p><p className="font-medium capitalize text-zinc-900">{customer.source || "—"}</p></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Orders</p><p className="mt-1 text-xl font-bold text-zinc-950">{customer.totalOrders ?? 0}</p></div>
          <div className="rounded-xl bg-zinc-50 p-3"><p className="text-xs text-zinc-500">Total Spent</p><p className="mt-1 text-lg font-bold text-zinc-950">Rs {Number(customer.totalSpent || 0).toLocaleString()}</p></div>
        </div>
        {customer.notes && <div><p className="text-zinc-500">Notes</p><p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{customer.notes}</p></div>}
      </div>
      <div className="mt-8"><Link href={`/customers/${customer.id}`} className="block rounded-xl border border-zinc-200 px-3 py-2 text-center text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">View full profile →</Link></div>
    </div>
  );
}
