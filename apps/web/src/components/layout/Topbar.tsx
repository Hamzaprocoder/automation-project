"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const { user, role, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return <header className="flex h-16 items-center justify-between border-b bg-background px-6">
    <div><p className="text-sm text-muted-foreground">Workspace</p></div>
    <div className="flex items-center gap-4">
      <div className="text-right"><p className="text-sm font-medium">{user?.name}</p><p className="text-xs text-muted-foreground capitalize">{role?.toLowerCase()}</p></div>
      <button onClick={handleLogout} className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">Logout</button>
    </div>
  </header>;
}
