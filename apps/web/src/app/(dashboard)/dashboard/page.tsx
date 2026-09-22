"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, organization } = useAuth();

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold tracking-tight">Dashboard</h1><p className="text-muted-foreground">Welcome back, {user?.name}</p></div>
    <div className="rounded-lg border bg-background p-6">
      <h2 className="text-lg font-semibold">Organization</h2>
      <p className="mt-2 text-muted-foreground">{organization?.name}</p>
      <p className="mt-4 text-sm text-muted-foreground">This is a temporary placeholder. In the next phase we will load real KPIs, attention items, and charts from the backend.</p>
    </div>
  </div>;
}
