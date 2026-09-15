import { ShieldCheck, Building2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { PasswordForm } from "./password-form";

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <PageHeader title="Account" description="Manage your own login credentials." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PasswordForm />
        </div>

        <div className="space-y-6 h-fit">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Signed in as
            </p>
            <div className="flex items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full accent-gradient text-sm font-semibold text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm text-slate-700 truncate">{user?.email}</p>
            </div>
          </div>

          {user && user.sites.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Building2 className="size-3.5" /> Site access
              </p>
              <ul className="space-y-2">
                {user.sites.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <ShieldCheck className="size-3.5" /> Password tips
            </p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>At least 8 characters — longer is stronger.</li>
              <li>Don&apos;t reuse a password from another site.</li>
              <li>You&apos;ll need your current password to confirm this change.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
