"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Logo } from "@/components/logo";
import { ToastProvider } from "@/components/toast";
import type { UserRole } from "@/lib/auth";

type SiteOption = { id: string; slug: string; name: string };

export function AdminShell({
  userEmail,
  sites,
  activeSiteId,
  role,
  isSuperAdminPanel,
  children,
}: {
  userEmail: string;
  sites: SiteOption[];
  activeSiteId: string | null;
  role: UserRole;
  isSuperAdminPanel: boolean;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
    <div className="flex h-screen overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          userEmail={userEmail}
          sites={sites}
          activeSiteId={activeSiteId}
          role={role}
          isSuperAdminPanel={isSuperAdminPanel}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/10 bg-(--sidebar-bg) px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <Logo className="h-8 w-auto" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
    </ToastProvider>
  );
}
