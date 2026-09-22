"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

interface CustomerOption { id: string; name: string | null; phone: string; }
interface ServiceOption { id: string; name: string; price?: number | null; }

interface LineItem { name: string; quantity: number; unitPrice: number; serviceId?: string; }

interface CreateOrderModalProps { open: boolean; onClose: () => void; onCreated: () => void; }

export default function CreateOrderModal({ open, onClose, onCreated }: CreateOrderModalProps) {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ name: "", quantity: 1, unitPrice: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    async function loadData() {
      setLoadingData(true);
      setError("");
      try {
        const [customerResult, serviceResult] = await Promise.all([
          api<{ data: CustomerOption[] }>("/api/customers?limit=50"),
          api<{ services: ServiceOption[] }>("/api/services"),
        ]);
        if (!active) return;
        setCustomers(customerResult.data || []);
        setServices(serviceResult.services || []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load form data");
      } finally {
        if (active) setLoadingData(false);
      }
    }
    void loadData();
    return () => { active = false; };
  }, [open]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items],
  );
  const total = Math.max(subtotal - discount + tax, 0);

  if (!open) return null;

  function addItem() {
    setItems((current) => [...current, { name: "", quantity: 1, unitPrice: 0 }]);
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function selectService(index: number, value: string) {
    const service = services.find((item) => item.id === value);
    setItems((current) => current.map((item, i) =>
      i === index
        ? { ...item, serviceId: value || undefined, name: service?.name || item.name, unitPrice: service?.price != null ? Number(service.price) : item.unitPrice }
        : item,
    ));
  }

  function removeItem(index: number) {
    setItems((current) => current.length === 1 ? current : current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || items.some((item) => !item.name.trim() || item.quantity < 1 || item.unitPrice < 0)) return;
    setError("");
    setLoading(true);
    try {
      await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          items: items.map((item) => ({
            name: item.name.trim(),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            ...(item.serviceId ? { serviceId: item.serviceId } : {}),
          })),
          discount,
          tax,
          notes: notes.trim() || undefined,
          status: "CONFIRMED",
          paymentStatus: "PENDING",
        }),
      });
      setCustomerId("");
      setItems([{ name: "", quantity: 1, unitPrice: 0 }]);
      setDiscount(0);
      setTax(0);
      setNotes("");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-950">New Order</h2>
            <p className="mt-1 text-sm text-zinc-500">Create an order with one or more line items.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-zinc-400 hover:bg-zinc-100" aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">Customer *</span>
            <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)} disabled={loadingData || loading}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-zinc-100">
              <option value="">{loadingData ? "Loading customers..." : "Select customer"}</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name || customer.phone} — {customer.phone}</option>)}
            </select>
          </label>

          <section>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-800">Line items</h3>
                <p className="text-xs text-zinc-500">Attach a service when applicable.</p>
              </div>
              <button type="button" onClick={addItem} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">+ Add item</button>
            </div>

            <div className="mt-3 space-y-3">
              {items.map((item, index) => (
                <div key={index} className="rounded-xl border border-zinc-200 p-3">
                  <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_80px_110px_auto] md:items-end">
                    <label>
                      <span className="text-[11px] font-semibold text-zinc-500">Service</span>
                      <select value={item.serviceId || ""} onChange={(e) => selectService(index, e.target.value)} disabled={loadingData || loading}
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-sm">
                        <option value="">Custom item</option>
                        {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="text-[11px] font-semibold text-zinc-500">Item name *</span>
                      <input required value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} placeholder="Item name"
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-sm" />
                    </label>
                    <label>
                      <span className="text-[11px] font-semibold text-zinc-500">Qty</span>
                      <input type="number" min={1} required value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-sm" />
                    </label>
                    <label>
                      <span className="text-[11px] font-semibold text-zinc-500">Unit price</span>
                      <input type="number" min={0} step="0.01" required value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-2.5 py-2 text-sm" />
                    </label>
                    <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1} className="rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-30">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="text-sm font-semibold text-zinc-800">Discount</span>
              <input type="number" min={0} step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm" />
            </label>
            <label className="block"><span className="text-sm font-semibold text-zinc-800">Tax</span>
              <input type="number" min={0} step="0.01" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm" />
            </label>
          </div>

          <div className="rounded-xl bg-zinc-50 p-4 text-sm">
            <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span>Rs {subtotal.toLocaleString()}</span></div>
            <div className="mt-1 flex justify-between text-zinc-600"><span>Discount</span><span>− Rs {discount.toLocaleString()}</span></div>
            <div className="mt-1 flex justify-between text-zinc-600"><span>Tax</span><span>+ Rs {tax.toLocaleString()}</span></div>
            <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 font-bold text-zinc-950"><span>Total</span><span>Rs {total.toLocaleString()}</span></div>
          </div>

          <label className="block"><span className="text-sm font-semibold text-zinc-800">Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1.5 w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm" placeholder="Order notes..." />
          </label>

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <button type="button" onClick={onClose} disabled={loading} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Cancel</button>
            <button type="submit" disabled={loading || loadingData || !customerId} className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50">{loading ? "Creating..." : "Create Order"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
