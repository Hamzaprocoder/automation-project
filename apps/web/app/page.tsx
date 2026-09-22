const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-zinc-500">Automation Project</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">WhatsApp Business CRM</h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Multi-tenant CRM foundation with WhatsApp Cloud API, conversations,
          appointments, orders, analytics, notifications, and audit logs.
        </p>
        <p className="mt-6 text-xs text-zinc-500">
          API: {apiUrl}
        </p>
      </div>
    </main>
  );
}
