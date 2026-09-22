"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface CustomerOption {
  id: string;
  name: string | null;
  phone: string;
}

interface ServiceOption {
  id: string;
  name: string;
  durationMins: number;
}

interface CreateAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAppointmentModal({
  open,
  onClose,
  onCreated,
}: CreateAppointmentModalProps) {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [startsAt, setStartsAt] = useState("");
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
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load form data");
        }
      } finally {
        if (active) setLoadingData(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || !startsAt) return;

    setError("");
    setLoading(true);

    try {
      await api("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          serviceId: serviceId || undefined,
          startsAt: new Date(startsAt).toISOString(),
          notes: notes.trim() || undefined,
        }),
      });

      setCustomerId("");
      setServiceId("");
      setStartsAt("");
      setNotes("");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-appointment-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="new-appointment-title" className="text-lg font-bold text-zinc-950">
              New Appointment
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Schedule a customer booking and optionally attach a service.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">Customer *</span>
            <select
              required
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              disabled={loadingData || loading}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            >
              <option value="">
                {loadingData ? "Loading customers..." : "Select customer"}
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name || customer.phone} — {customer.phone}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">Service</span>
            <select
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              disabled={loadingData || loading}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            >
              <option value="">
                {loadingData ? "Loading services..." : "No service selected"}
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.durationMins} min)
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">Date & Time *</span>
            <input
              type="datetime-local"
              required
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              disabled={loading}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              disabled={loading}
              placeholder="Any special requests..."
              className="mt-1.5 w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingData || !customerId || !startsAt}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
