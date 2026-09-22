import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-zinc-50 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
