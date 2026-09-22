"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import CustomerList, { type Customer } from "@/components/customers/CustomerList";
import CreateCustomerModal from "@/components/customers/CreateCustomerModal";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async (searchTerm = search) => {
    setLoading(true); setError("");
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
      const result = await api<{ data: Customer[] }>(`/api/customers${query}`);
      setCustomers(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { void loadCustomers(""); }, [loadCustomers]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadCustomers(search);
  }

  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-zinc-950">Customers</h1><p className="mt-1 text-sm text-zinc-500">Manage your customer relationships.</p></div><button onClick={() => setShowModal(true)} className="rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800">+ Add Customer</button></header>
    <form onSubmit={handleSearch} className="flex gap-3"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by name, phone or email..." className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-500" /><button type="submit" className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-50">Search</button></form>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <CustomerList customers={customers} loading={loading} />
    <CreateCustomerModal open={showModal} onClose={()=>setShowModal(false)} onCreated={()=>void loadCustomers(search)} />
  </div>;
}
