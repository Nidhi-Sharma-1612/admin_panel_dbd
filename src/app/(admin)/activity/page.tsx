import { and, eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, sites, users } from "@/db/schema";
import { getCurrentUser, isSuperAdminPanel } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";

const ACTION_STYLES: Record<string, string> = {
  created: "bg-emerald-50 text-emerald-700",
  uploaded: "bg-emerald-50 text-emerald-700",
  updated: "bg-accent/10 text-accent-dark",
  deleted: "bg-red-50 text-red-600",
};

export default async function ActivityPage() {
  const user = await getCurrentUser();
  const superAdminPanel = user ? isSuperAdminPanel(user) : false;

  if (superAdminPanel) {
    const entries = await db
      .select({
        id: activityLog.id,
        action: activityLog.action,
        entity: activityLog.entity,
        entityId: activityLog.entityId,
        createdAt: activityLog.createdAt,
        siteName: sites.name,
        userName: users.name,
      })
      .from(activityLog)
      .leftJoin(sites, eq(sites.id, activityLog.siteId))
      .leftJoin(users, eq(users.id, activityLog.userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(100);

    return (
      <div className="space-y-6">
        <PageHeader
          title="Activity"
          description="Cross-site activity across all sites and users."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {entries.length === 0 ? (
            <p className="text-sm text-slate-400">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {entries.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        ACTION_STYLES[a.action] ?? "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {a.action}
                    </span>
                    <span className="text-slate-700">
                      <span className="font-medium">{a.userName ?? "Unknown user"}</span>{" "}
                      <span className="text-slate-500">
                        {a.action} {a.entity}
                      </span>
                      {a.entityId ? <span className="text-slate-400"> : {a.entityId}</span> : null}
                      {a.siteName && <span className="text-slate-400"> on {a.siteName}</span>}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {a.createdAt.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;

  const entries =
    siteId && user
      ? await db
          .select({
            id: activityLog.id,
            action: activityLog.action,
            entity: activityLog.entity,
            entityId: activityLog.entityId,
            createdAt: activityLog.createdAt,
          })
          .from(activityLog)
          .where(and(eq(activityLog.siteId, siteId), eq(activityLog.userId, user.id)))
          .orderBy(desc(activityLog.createdAt))
          .limit(100)
      : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Activity" description="Your edit history for this site." />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {entries.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      ACTION_STYLES[a.action] ?? "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {a.action}
                  </span>
                  <span className="text-slate-700">
                    You <span className="text-slate-500">{a.entity}</span>
                    {a.entityId ? <span className="text-slate-400"> : {a.entityId}</span> : null}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {a.createdAt.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
