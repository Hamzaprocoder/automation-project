"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCustomerModal({ open, onClose, onCreated }: CreateCustomerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("manual");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/customers", {
        method: "POST",
        body: JSON.stringify({ name, phone, email, source, notes }),
      });
      setName(""); setPhone(""); setEmail(""); setSource("manual"); setNotes("");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div><h2 className="text-lg font-semibold text-zinc-950">Add New Customer</h2><p className="mt-1 text-sm text-zinc-500">Create a customer record for your workspace.</p></div>
          <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100" aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <label className="block text-sm font-medium text-zinc-700">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-500" placeholder="Ahmed Raza" /></label>
          <label className="block text-sm font-medium text-zinc-700">Phone *<input required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-500" placeholder="03001234567" /></label>
          <label className="block text-sm font-medium text-zinc-700">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-500" placeholder="ahmed@example.com" /></label>
          <label className="block text-sm font-medium text-zinc-700">Source<select value={source} onChange={(e) => setSource(e.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none"><option value="manual">Manual</option><option value="whatsapp">WhatsApp</option><option value="walk-in">Walk-in</option><option value="referral">Referral</option></select></label>
          <label className="block text-sm font-medium text-zinc-700">Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none" placeholder="Any important notes..." /></label>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50">Cancel</button><button type="submit" disabled={loading} className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50">{loading ? "Saving..." : "Save Customer"}</button></div>
        </form>
      </div>
    </div>
  );
}
