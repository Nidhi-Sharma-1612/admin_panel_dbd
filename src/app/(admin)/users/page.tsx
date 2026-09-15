import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Plus, ChevronRight } from "lucide-react";
import { db } from "@/db";
import { userSites, users, sites } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "super_admin") redirect("/");
  if (currentUser.activeSiteId !== null) redirect("/");

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      siteName: sites.name,
    })
    .from(users)
    .leftJoin(userSites, eq(userSites.userId, users.id))
    .leftJoin(sites, eq(sites.id, userSites.siteId));

  const byUser = new Map<
    string,
    { id: string; name: string; email: string; createdAt: Date; siteNames: string[] }
  >();
  for (const row of rows) {
    const existing = byUser.get(row.id);
    if (existing) {
      if (row.siteName) existing.siteNames.push(row.siteName);
    } else {
      byUser.set(row.id, {
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.createdAt,
        siteNames: row.siteName ? [row.siteName] : [],
      });
    }
  }
  const people = [...byUser.values()];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="All users across every site. Manage access per user below."
        action={
          <Link
            href="/users/new"
            className="flex items-center gap-1.5 rounded-full accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-accent/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> Add user
          </Link>
        }
      />

      {people.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No users yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {people.map((u) => (
            <Link
              key={u.id}
              href={`/users/${u.id}`}
              className="flex items-center gap-3 p-5 hover:bg-slate-50 transition-colors"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-full accent-gradient text-sm font-semibold text-white">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{u.name}</p>
                <p className="text-sm text-slate-500">{u.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {u.siteNames.length === 0 ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                      No sites
                    </span>
                  ) : (
                    u.siteNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-dark"
                      >
                        {name}
                      </span>
                    ))
                  )}
                </div>
              </div>
              {u.id === currentUser?.id && (
                <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-dark">
                  You
                </span>
              )}
              <ChevronRight className="size-4 shrink-0 text-slate-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
