"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number | string;
  createdAt: string;
  customer: { id: string; name: string | null; phone: string; };
}

interface OrderListProps { orders: Order[]; loading: boolean; onUpdate: () => void; }

const statusClasses: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};
const paymentClasses: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PARTIALLY_PAID: "bg-orange-50 text-orange-700 ring-orange-200",
  REFUNDED: "bg-red-50 text-red-700 ring-red-200",
};

export default function OrderList({ orders, loading, onUpdate }: OrderListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateOrder(id: string, data: Record<string, string>) {
    setUpdatingId(id);
    setError("");
    try {
      await api(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) });
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">Loading orders...</div>;
  if (orders.length === 0) return <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center"><p className="text-sm font-semibold text-zinc-800">No orders found</p><p className="mt-1 text-xs text-zinc-500">Create an order or adjust your filters.</p></div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {error && <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>{["Order #","Customer","Total","Status","Payment","Date"].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">{heading}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {orders.map((order) => (
              <tr key={order.id} className="transition hover:bg-zinc-50/70">
                <td className="px-5 py-4 font-semibold text-zinc-900">{order.orderNumber}</td>
                <td className="px-5 py-4"><div className="font-medium text-zinc-900">{order.customer.name || "Unknown customer"}</div><div className="mt-0.5 text-xs text-zinc-500">{order.customer.phone}</div></td>
                <td className="px-5 py-4 font-semibold text-zinc-900">Rs {Number(order.total).toLocaleString()}</td>
                <td className="px-5 py-4"><select value={order.status} disabled={updatingId === order.id} onChange={(e) => void updateOrder(order.id, { status: e.target.value })} className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ring-1 ring-inset outline-none ${statusClasses[order.status] || statusClasses.DRAFT}`}><option value="DRAFT">Draft</option><option value="CONFIRMED">Confirmed</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></td>
                <td className="px-5 py-4"><select value={order.paymentStatus} disabled={updatingId === order.id} onChange={(e) => void updateOrder(order.id, { paymentStatus: e.target.value })} className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ring-1 ring-inset outline-none ${paymentClasses[order.paymentStatus] || paymentClasses.PENDING}`}><option value="PENDING">Pending</option><option value="PAID">Paid</option><option value="PARTIALLY_PAID">Partial</option><option value="REFUNDED">Refunded</option></select></td>
                <td className="px-5 py-4 text-zinc-500">{new Date(order.createdAt).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
