"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import KpiCard from "@/components/dashboard/KpiCard";
import AttentionList from "@/components/dashboard/AttentionList";
import RecentCustomers from "@/components/dashboard/RecentCustomers";

type DashboardData = {
  kpis: {
    totalCustomers: number;
    newCustomersLast7Days: number;
    newCustomersLast30Days: number;
    openConversations: number;
    unansweredConversations: number;
    todaysAppointments: number;
    overdueFollowUps: number;
    revenueThisMonth: number;
  };
  attentionRequired: Array<{
    type: string;
    message: string;
    count: number;
    severity: "high" | "medium" | "low";
  }>;
  recentCustomers: Array<{
    id: string;
    name: string | null;
    phone: string;
    source: string | null;
    createdAt: string;
    lastInteractionAt: string | null;
  }>;
};

export default function DashboardPage() {
  const { user, organization } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const result = await api<DashboardData>("/api/dashboard/overview");
        if (active) setData(result);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-zinc-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold">Unable to load dashboard</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, attentionRequired, recentCustomers } = data;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header>
        <p className="text-sm font-medium text-zinc-500">{organization?.name || "Your workspace"}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Welcome back, {user?.name}. Here is what is happening today.</p>
      </header>

      <section aria-label="Key performance indicators" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Customers" value={kpis.totalCustomers} description="Active customers" />
        <KpiCard title="New Customers" value={kpis.newCustomersLast7Days} description="Last 7 days" />
        <KpiCard title="Open Conversations" value={kpis.openConversations} description="Currently open" />
        <KpiCard title="Unanswered" value={kpis.unansweredConversations} description="Need a reply" />
        <KpiCard title="Today's Appointments" value={kpis.todaysAppointments} />
        <KpiCard title="Overdue Follow-ups" value={kpis.overdueFollowUps} />
        <KpiCard title="Revenue This Month" value={`Rs ${kpis.revenueThisMonth.toLocaleString()}`} />
        <KpiCard title="New Customers" value={kpis.newCustomersLast30Days} description="Last 30 days" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <AttentionList items={attentionRequired} />
        <RecentCustomers customers={recentCustomers} />
      </section>
    </div>
  );
}
