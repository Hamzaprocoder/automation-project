"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export interface Appointment {
  id: string;
  startsAt: string;
  endsAt: string | null;
  status: string;
  notes: string | null;
  customer: {
    id: string;
    name: string | null;
    phone: string;
  };
  service: {
    id: string;
    name: string;
  } | null;
}

interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
  onStatusChange: () => void;
}

const statusClasses: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700 ring-blue-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  COMPLETED: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
  NO_SHOW: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function AppointmentList({
  appointments,
  loading,
  onStatusChange,
}: AppointmentListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    setError("");

    try {
      await api(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      onStatusChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update appointment");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
        Loading appointments...
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-sm font-semibold text-zinc-800">No appointments found</p>
        <p className="mt-1 text-xs text-zinc-500">
          Create an appointment or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Customer</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Service</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Date & Time</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="transition hover:bg-zinc-50/70">
                <td className="px-5 py-4">
                  <div className="font-semibold text-zinc-900">
                    {appointment.customer.name || "Unknown customer"}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {appointment.customer.phone}
                  </div>
                </td>
                <td className="px-5 py-4 text-zinc-700">
                  {appointment.service?.name || "—"}
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-zinc-800">
                    {new Date(appointment.startsAt).toLocaleDateString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {new Date(appointment.startsAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {appointment.endsAt
                      ? ` — ${new Date(appointment.endsAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : ""}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[appointment.status] || "bg-zinc-100 text-zinc-700 ring-zinc-200"}`}>
                    {appointment.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <select
                    value={appointment.status}
                    disabled={updatingId === appointment.id}
                    onChange={(event) => void updateStatus(appointment.id, event.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 disabled:opacity-50"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="NO_SHOW">No Show</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
