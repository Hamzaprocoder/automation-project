"use client";
import { useEffect,useState } from "react";
import { api } from "@/lib/api";
import KpiCard from "@/components/dashboard/KpiCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import CustomerGrowthChart from "@/components/dashboard/CustomerGrowthChart";
export default function AnalyticsPage(){const[data,setData]=useState<Record<string,unknown>|null>(null);const[rev,setRev]=useState<Array<{date:string;revenue:number}>>([]);const[growth,setGrowth]=useState<Array<{date:string;count:number}>>([]);const[error,setError]=useState("");
useEffect(()=>{Promise.all([api<Record<string,unknown>>("/api/analytics/overview"),api<{series:Array<{date:string;revenue:number}>}>("/api/analytics/revenue-series?days=30"),api<{series:Array<{date:string;count:number}>}>("/api/analytics/customer-growth?days=30")]).then(([a,b,c])=>{setData(a);setRev(b.series||[]);setGrowth(c.series||[])}).catch(e=>setError(e instanceof Error?e.message:"Failed to load analytics"))},[]);
const values=Object.entries(data||{}).filter(([,v])=>typeof v==="number").slice(0,4);
return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-sm text-zinc-500">Business performance over time.</p></div>{error&&<div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{values.map(([k,v])=><KpiCard key={k} title={k.replace(/([A-Z])/g," $1")} value={Number(v).toLocaleString()}/>)}</div><div className="grid gap-6 lg:grid-cols-2"><section className="rounded-xl border bg-white p-6"><h2 className="mb-3 text-lg font-semibold">Revenue — 30 days</h2><RevenueChart data={rev}/></section><section className="rounded-xl border bg-white p-6"><h2 className="mb-3 text-lg font-semibold">Customer Growth — 30 days</h2><CustomerGrowthChart data={growth}/></section></div></div>;}
