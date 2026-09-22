"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import CreateOrderModal from "@/components/orders/CreateOrderModal";
import OrderList, { type Order } from "@/components/orders/OrderList";

const ORDER_STATUSES = ["DRAFT","CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED"] as const;
const PAYMENT_STATUSES = ["PENDING","PAID","PARTIALLY_PAID","REFUNDED"] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (paymentFilter) params.set("paymentStatus", paymentFilter);
      const query = params.toString();
      const result = await api<{ data: Order[] }>(`/api/orders${query ? `?${query}` : ""}`);
      setOrders(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [paymentFilter, statusFilter]);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-medium text-zinc-500">Sales</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">Orders</h1><p className="mt-1 text-sm text-zinc-500">Track sales, order progress, and payments.</p></div>
        <button type="button" onClick={() => setShowModal(true)} className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800">+ New Order</button>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label><span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Order status</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1.5 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm"><option value="">All statuses</option>{ORDER_STATUSES.map((status) => <option key={status} value={status}>{status.replace("_"," ")}</option>)}</select></label>
          <label><span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Payment</span><select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="mt-1.5 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm"><option value="">All payments</option>{PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status.replace("_"," ")}</option>)}</select></label>
          {(statusFilter || paymentFilter) && <button type="button" onClick={() => { setStatusFilter(""); setPaymentFilter(""); }} className="self-end rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50">Clear filters</button>}
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <OrderList orders={orders} loading={loading} onUpdate={() => void loadOrders()} />
      <CreateOrderModal open={showModal} onClose={() => setShowModal(false)} onCreated={() => void loadOrders()} />
    </div>
  );
}
