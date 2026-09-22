"use client";

import { useAuth } from "@/context/AuthContext";
import BusinessSettingsForm from "@/components/settings/BusinessSettingsForm";

export default function SettingsPage() {
  const { user, organization, role } = useAuth();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-sm font-medium text-zinc-500">Workspace</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your business profile and account details.</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-950">Your account</h2>
        <p className="mt-1 text-sm text-zinc-500">The account currently signed in to this workspace.</p>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Name</dt><dd className="mt-1 font-medium text-zinc-900">{user?.name || "—"}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Email</dt><dd className="mt-1 font-medium text-zinc-900">{user?.email || "—"}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Role</dt><dd className="mt-1 font-medium capitalize text-zinc-900">{role?.toLowerCase() || "—"}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Organization</dt><dd className="mt-1 font-medium text-zinc-900">{organization?.name || "—"}</dd></div>
        </dl>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-950">Business profile</h2>
        <p className="mt-1 text-sm text-zinc-500">Update the basic information shown in your CRM workspace.</p>
        <div className="mt-6"><BusinessSettingsForm /></div>
      </section>

      <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
        <h2 className="text-lg font-bold text-zinc-900">Coming soon</h2>
        <ul className="mt-3 grid gap-2 text-sm text-zinc-500 sm:grid-cols-2">
          <li>Working hours & timezone</li><li>WhatsApp connection settings</li><li>Message templates</li><li>Notification preferences</li><li>Team members & invites</li>
        </ul>
      </section>
    </div>
  );
}
