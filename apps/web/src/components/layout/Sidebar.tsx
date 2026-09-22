"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Customers", href: "/customers", icon: "👥" },
  { name: "Inbox", href: "/conversations", icon: "💬" },
  { name: "Appointments", href: "/appointments", icon: "📅" },
  { name: "Orders", href: "/orders", icon: "🛒" },
  { name: "Analytics", href: "/analytics", icon: "📈" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { organization } = useAuth();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">WhatsApp CRM</Link>
      </div>
      <div className="border-b px-6 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Organization</p>
        <p className="mt-1 truncate text-sm font-semibold">{organization?.name || "My Business"}</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return <Link key={item.name} href={item.href} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><span>{item.icon}</span>{item.name}</Link>;
        })}
      </nav>
      <div className="border-t p-4"><p className="text-xs text-muted-foreground">Local Business CRM</p></div>
    </aside>
  );
}
