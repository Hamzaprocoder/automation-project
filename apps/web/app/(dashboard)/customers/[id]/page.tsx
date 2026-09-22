"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

type CustomerProfile = {
  id: string; name: string | null; phone: string; email: string | null; source: string | null; status: string;
  whatsappNumber: string | null; address: string | null; notes: string | null; totalOrders: number; totalSpent: number;
  firstInteractionAt: string | null; lastInteractionAt: string | null; createdAt: string;
  conversations: Array<{ id: string; lastMessageAt: string | null; status: string; messages: Array<{ id: string; body: string; createdAt: string; direction: string }> }>;
  appointments: Array<{ id: string; startAt: string; endAt: string; status: string; title: string | null }>;
  tasks: Array<{ id: string; title: string; status: string; createdAt: string }>;
};

export default function CustomerProfilePage() {
  const params = useParams();
  const customerId = String(params.id);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await api<{ customer: CustomerProfile }>(`/api/customers/${customerId}`);
        if (active) setCustomer(result.customer);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Customer not found");
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [customerId]);

  if (loading) return <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">Loading customer...</div>;
  if (error || !customer) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error || "Customer not found"}</div>;

  return <div className="mx-auto max-w-7xl space-y-6">
    <header><Link href="/customers" className="text-sm text-zinc-500 hover:underline">← Back to Customers</Link><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-zinc-950">{customer.name || "Unknown Customer"}</h1><p className="mt-1 text-sm text-zinc-500">{customer.phone}</p></div><span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">{customer.status.toLowerCase()}</span></div></header>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Total Orders",customer.totalOrders],["Total Spent",`Rs ${Number(customer.totalSpent).toLocaleString()}`],["Status",customer.status.toLowerCase()],["Source",customer.source || "—"]].map(([label,value])=><div key={String(label)} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"><p className="text-sm text-zinc-500">{label}</p><p className="mt-1 text-2xl font-bold capitalize text-zinc-950">{value}</p></div>)}</section>
    <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Contact Information</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-zinc-500">Email</dt><dd className="mt-1 font-medium">{customer.email || "—"}</dd></div><div><dt className="text-zinc-500">WhatsApp</dt><dd className="mt-1 font-medium">{customer.whatsappNumber || customer.phone}</dd></div><div><dt className="text-zinc-500">Address</dt><dd className="mt-1 font-medium">{customer.address || "—"}</dd></div><div><dt className="text-zinc-500">First Interaction</dt><dd className="mt-1 font-medium">{customer.firstInteractionAt ? new Date(customer.firstInteractionAt).toLocaleString() : "—"}</dd></div><div><dt className="text-zinc-500">Last Interaction</dt><dd className="mt-1 font-medium">{customer.lastInteractionAt ? new Date(customer.lastInteractionAt).toLocaleString() : "—"}</dd></div></dl></div><div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Notes</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-600">{customer.notes || "No notes yet."}</p></div></section>
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Timeline</h2><div className="mt-5 space-y-5">{customer.conversations.length ? customer.conversations.map((conv)=><div key={conv.id} className="border-l-2 border-zinc-200 pl-4"><Link href={`/conversations/${conv.id}`} className="font-medium text-zinc-950 hover:underline">Conversation</Link><p className="mt-1 text-xs text-zinc-500">{conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : "No messages yet"} · {conv.status.toLowerCase()}</p>{conv.messages[0] && <p className="mt-2 text-sm text-zinc-600">{conv.messages[0].body}</p>}</div>) : <p className="text-sm text-zinc-500">No conversations yet.</p>}{customer.appointments.map((appointment)=><div key={appointment.id} className="border-l-2 border-zinc-200 pl-4"><p className="font-medium">{appointment.title || "Appointment"}</p><p className="mt-1 text-xs text-zinc-500">{new Date(appointment.startAt).toLocaleString()} · {appointment.status.toLowerCase()}</p></div>)}{customer.tasks.map((task)=><div key={task.id} className="border-l-2 border-zinc-200 pl-4"><p className="font-medium">{task.title}</p><p className="mt-1 text-xs text-zinc-500">{task.status.toLowerCase()}</p></div>)}</div></section>
  </div>;
}
