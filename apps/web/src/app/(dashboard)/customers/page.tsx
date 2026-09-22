"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import CustomerList, { Customer } from "@/components/customers/CustomerList";
export default function CustomersPage() {
 const [customers,setCustomers]=useState<Customer[]>([]), [loading,setLoading]=useState(true), [search,setSearch]=useState(""), [error,setError]=useState("");
 useEffect(()=>{setLoading(true);api<{data:Customer[]}>("/api/customers?limit=50&page=1"+(search?"&search="+encodeURIComponent(search):"")).then(r=>setCustomers(r.data||[])).catch(e=>setError(e instanceof Error?e.message:"Failed to load customers")).finally(()=>setLoading(false))},[search]);
 return <div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold">Customers</h1><p className="text-sm text-zinc-500">Manage customer records and activity.</p></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone or email..." className="w-full rounded-lg border px-3 py-2 text-sm sm:w-80"/></div>{error&&<div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}<CustomerList customers={customers} loading={loading}/></div>;
}