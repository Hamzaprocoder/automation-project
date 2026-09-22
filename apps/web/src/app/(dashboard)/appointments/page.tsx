"use client";
import { useCallback,useEffect,useState } from "react";
import { api } from "@/lib/api";
import AppointmentList,{Appointment} from "@/components/appointments/AppointmentList";
export default function AppointmentsPage(){const[items,setItems]=useState<Appointment[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
const load=useCallback(()=>{setLoading(true);api<{appointments:Appointment[]}>("/api/appointments").then(r=>setItems(r.appointments||[])).catch(e=>setError(e instanceof Error?e.message:"Failed to load appointments")).finally(()=>setLoading(false))},[]);
useEffect(()=>{load()},[load]);return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Appointments</h1><p className="text-sm text-zinc-500">Track scheduled visits and update status.</p></div>{error&&<div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}<AppointmentList appointments={items} loading={loading} onStatusChange={load}/></div>;}
