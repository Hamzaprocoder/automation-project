"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import AppointmentList, {
  type Appointment,
} from "@/components/appointments/AppointmentList";
import CreateAppointmentModal from "@/components/appointments/CreateAppointmentModal";

const STATUSES = ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

function toStartOfDay(value: string) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : "";
}

function toEndOfDay(value: string) {
  return value ? new Date(`${value}T23:59:59.999`).toISOString() : "";
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState("");

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (fromDate) params.set("from", toStartOfDay(fromDate));
      if (toDate) params.set("to", toEndOfDay(toDate));

      const query = params.toString();
      const result = await api<{ data: Appointment[] }>(
        `/api/appointments${query ? `?${query}` : ""}`,
      );
      setAppointments(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [fromDate, statusFilter, toDate]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Scheduling</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage bookings, services, and customer schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
        >
          + New Appointment
        </button>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 lg:w-44"
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              From
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              To
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </label>

          {(statusFilter || fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("");
                setFromDate("");
                setToDate("");
              }}
              className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AppointmentList
        appointments={appointments}
        loading={loading}
        onStatusChange={() => void loadAppointments()}
      />

      <CreateAppointmentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => void loadAppointments()}
      />
    </div>
  );
}
