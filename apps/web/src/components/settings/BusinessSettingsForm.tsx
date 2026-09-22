"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function BusinessSettingsForm() {
  const { organization, refresh, role } = useAuth();
  const [name, setName] = useState(organization?.name || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(organization?.name || "");
  }, [organization?.name]);

  const canEdit = role === "OWNER" || role === "ADMIN";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api("/api/organization", {
        method: "PATCH",
        body: JSON.stringify({ name: trimmedName }),
      });
      await refresh();
      setMessage("Business name updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

      <div>
        <label htmlFor="business-name" className="block text-sm font-semibold text-zinc-800">Business name</label>
        <input
          id="business-name"
          type="text"
          minLength={2}
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={!canEdit || loading}
          className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-zinc-100 disabled:bg-zinc-50 disabled:text-zinc-500"
        />
        <p className="mt-1.5 text-xs text-zinc-500">{canEdit ? "This name is shown across the CRM." : "Only owners and admins can change the business name."}</p>
      </div>

      <div>
        <label htmlFor="organization-id" className="block text-sm font-semibold text-zinc-800">Organization ID</label>
        <input id="organization-id" type="text" value={organization?.id || ""} disabled className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-500" />
      </div>

      {canEdit && (
        <button type="submit" disabled={loading || !name.trim()} className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50">
          {loading ? "Saving..." : "Save changes"}
        </button>
      )}
    </form>
  );
}
