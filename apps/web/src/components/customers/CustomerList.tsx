"use client";

import Link from "next/link";

export interface Customer {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  source: string | null;
  status: string;
  totalOrders: number;
  totalSpent: number;
  lastInteractionAt: string | null;
  createdAt: string;
}

export default function CustomerList({ customers, loading }: { customers: Customer[]; loading: boolean }) {
  if (loading) return <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">Loading customers...</div>;
  if (!customers.length) return <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center"><p className="font-medium text-zinc-900">No customers found.</p><p className="mt-1 text-sm text-zinc-500">Try a different search or add your first customer.</p></div>;

  return <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm"><table className="w-full min-w-[760px] text-sm"><thead className="border-b bg-zinc-50"><tr>{["Name","Phone","Source","Orders","Total Spent","Last Interaction"].map((h)=><th key={h} className="px-4 py-3 text-left font-medium text-zinc-600">{h}</th>)}</tr></thead><tbody className="divide-y divide-zinc-100">{customers.map((customer)=><tr key={customer.id} className="hover:bg-zinc-50"><td className="px-4 py-3"><Link href={`/customers/${customer.id}`} className="font-medium text-zinc-950 hover:underline">{customer.name || "Unknown"}</Link></td><td className="px-4 py-3 text-zinc-700">{customer.phone}</td><td className="px-4 py-3 capitalize text-zinc-600">{customer.source || "—"}</td><td className="px-4 py-3">{customer.totalOrders}</td><td className="px-4 py-3">Rs {Number(customer.totalSpent).toLocaleString()}</td><td className="px-4 py-3 text-zinc-500">{customer.lastInteractionAt ? new Date(customer.lastInteractionAt).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div>;
}
