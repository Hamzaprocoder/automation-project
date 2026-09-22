"use client";
import { useCallback,useEffect,useState } from "react";
import { api } from "@/lib/api";
import OrderList,{Order} from "@/components/orders/OrderList";
export default function OrdersPage(){const[items,setItems]=useState<Order[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
const load=useCallback(()=>{setLoading(true);api<{orders:Order[]}>("/api/orders").then(r=>setItems(r.orders||[])).catch(e=>setError(e instanceof Error?e.message:"Failed to load orders")).finally(()=>setLoading(false))},[]);
useEffect(()=>{load()},[load]);return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Orders</h1><p className="text-sm text-zinc-500">Monitor orders, fulfillment, and payments.</p></div>{error&&<div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}<OrderList orders={items} loading={loading} onUpdate={load}/></div>;}
