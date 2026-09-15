"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  LayoutGrid,
  HelpCircle,
  Layers,
  History,
  Users,
  Settings,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { logoutAction, switchSiteAction } from "@/app/(admin)/actions";
import type { UserRole } from "@/lib/auth";

const SUPER_ADMIN_PANEL_NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/users", label: "Users", icon: Users },
  { href: "/activity", label: "Activity", icon: History },
  { href: "/account", label: "Account", icon: UserCircle },
];

const PER_SITE_NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/pages", label: "Pages", icon: Layers },
  { href: "/activity", label: "Activity", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/account", label: "Account", icon: UserCircle },
];

type SiteOption = { id: string; slug: string; name: string };

export function Sidebar({
  userEmail,
  sites,
  activeSiteId,
  role,
  isSuperAdminPanel,
  onNavigate,
}: {
  userEmail: string;
  sites: SiteOption[];
  activeSiteId: string | null;
  role: UserRole;
  isSuperAdminPanel: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const activeSite = sites.find((s) => s.id === activeSiteId) ?? sites[0];
  const selectedValue = isSuperAdminPanel ? "" : activeSite?.id ?? "";
  const navItems = isSuperAdminPanel ? SUPER_ADMIN_PANEL_NAV_ITEMS : PER_SITE_NAV_ITEMS;

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-(--sidebar-bg)">
      <div className="px-5 py-6 border-b border-white/10">
        <Logo className="h-9 w-auto" />
      </div>

      {sites.length > 0 && (
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-cream/40 mb-1.5">
            Site
          </p>
          <form>
            <div className="relative">
              <select
                name="siteId"
                defaultValue={selectedValue}
                onChange={(e) => {
                  const fd = new FormData();
                  fd.set("siteId", e.target.value);
                  startTransition(async () => {
                    try {
                      await switchSiteAction(fd);
                    } finally {
                      // Switching sites redirects to "/" — the same route we're
                      // already on, so Next's router sees no URL change and
                      // won't refetch the server tree on its own. Force it so
                      // the sidebar/nav reflect the new site immediately.
                      router.refresh();
                    }
                  });
                }}
                className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-2 pl-3 pr-8 text-sm font-medium text-white outline-none focus:border-accent [&>option]:bg-(--sidebar-bg) [&>option]:text-white"
              >
                {role === "super_admin" && <option value="">Super Admin Panel</option>}
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            </div>
          </form>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-accent bg-accent/15 text-accent-light"
                  : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                className={`size-4.5 transition-colors ${
                  active ? "text-accent-light" : "text-white/40 group-hover:text-white/70"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
        <div className="grid size-8 shrink-0 place-items-center rounded-full accent-gradient text-xs font-semibold text-(--sidebar-bg)">
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs text-white/50">{userEmail}</p>
          {role === "super_admin" && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-accent-light">
              Super admin
            </span>
          )}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Sign out"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
