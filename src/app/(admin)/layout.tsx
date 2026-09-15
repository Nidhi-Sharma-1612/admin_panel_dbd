import { redirect } from "next/navigation";
import { getCurrentUser, isSuperAdminPanel } from "@/lib/auth";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const superAdminPanel = isSuperAdminPanel(user);
  const activeSiteId = superAdminPanel ? null : user.activeSiteId ?? user.sites[0]?.id ?? null;

  return (
    <AdminShell
      userEmail={user.email}
      sites={user.sites}
      activeSiteId={activeSiteId}
      role={user.role}
      isSuperAdminPanel={superAdminPanel}
    >
      {children}
    </AdminShell>
  );
}
