import { and, eq, desc, count } from "drizzle-orm";
import {
  HelpCircle,
  Layers,
  Blocks,
  Settings,
  Link as LinkIcon,
  MessageCirclePlus,
  ExternalLink,
  History,
  Building2,
  Users as UsersIcon,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { faqs, pages, pageSections, activityLog, sites, users } from "@/db/schema";
import { getCurrentUser, isSuperAdminPanel } from "@/lib/auth";
import { SwitchSiteButton } from "./switch-site-button";

const STAT_CARDS = [
  { key: "faqs", label: "FAQs", icon: HelpCircle, href: "/faqs" },
  { key: "pages", label: "Editable pages", icon: Layers, href: "/pages" },
  { key: "sections", label: "Content blocks", icon: Blocks, href: "/pages" },
] as const;

const ACTION_STYLES: Record<string, string> = {
  created: "bg-emerald-50 text-emerald-700",
  uploaded: "bg-emerald-50 text-emerald-700",
  updated: "bg-accent/10 text-accent-dark",
  deleted: "bg-red-50 text-red-600",
};

export default async function OverviewPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="text-sm text-slate-500">
        No site assigned to this account yet. Ask an admin to add you to a site.
      </div>
    );
  }

  if (isSuperAdminPanel(user)) {
    return <SuperAdminOverview name={user.name} sites={user.sites} />;
  }

  const siteId = user.activeSiteId ?? user.sites[0]?.id;
  const siteName = user.sites.find((s) => s.id === siteId)?.name ?? "your site";

  if (!siteId) {
    return (
      <div className="text-sm text-slate-500">
        No site assigned to this account yet. Ask an admin to add you to a site.
      </div>
    );
  }

  const [[site], [faqCount], [pageCount], [sectionCount], recentActivity] =
    await Promise.all([
      db.select().from(sites).where(eq(sites.id, siteId)).limit(1),
      db.select({ value: count() }).from(faqs).where(eq(faqs.siteId, siteId)),
      db.select({ value: count() }).from(pages).where(eq(pages.siteId, siteId)),
      db.select({ value: count() }).from(pageSections).where(eq(pageSections.siteId, siteId)),
      db
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
        .limit(8),
    ]);

  const counts: Record<string, number> = {
    faqs: faqCount.value,
    pages: pageCount.value,
    sections: sectionCount.value,
  };

  const liveUrl = site?.frontendUrl || (site?.domain ? `https://${site.domain}` : null);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-dark">
            <Layers className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
            <p className="text-sm text-slate-500">
              Managing <span className="font-medium text-slate-700">{siteName}</span>. Use the
              sidebar to edit FAQs, page content, and site settings.
            </p>
          </div>
        </div>

        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-accent/40 hover:text-accent-dark"
          >
            View live site <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              href={card.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-accent/40 hover:shadow-md"
            >
              <div className="mb-3 grid size-9 place-items-center rounded-lg bg-accent/10 text-accent-dark">
                <Icon className="size-4.5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{counts[card.key] ?? 0}</p>
              <p className="text-sm text-slate-500">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Recent activity
            </h2>
            <Link href="/activity" className="text-sm font-medium text-accent-dark">
              View all
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="grid size-11 place-items-center rounded-full bg-slate-100 text-slate-400">
                <History className="size-5" />
              </div>
              <p className="text-sm text-slate-400">
                No edits yet — changes you make will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentActivity.map((a) => (
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
                      {a.entityId ? (
                        <span className="text-slate-400"> : {a.entityId}</span>
                      ) : null}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {a.createdAt.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Quick links
          </h2>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-slate-700 transition-colors hover:bg-slate-50 hover:text-accent-dark"
              >
                <Settings className="size-4" /> Site settings
              </Link>
            </li>
            <li>
              <Link
                href="/pages"
                className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-slate-700 transition-colors hover:bg-slate-50 hover:text-accent-dark"
              >
                <LinkIcon className="size-4" /> Navbar &amp; footer links
              </Link>
            </li>
            <li>
              <Link
                href="/faqs/new"
                className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-slate-700 transition-colors hover:bg-slate-50 hover:text-accent-dark"
              >
                <MessageCirclePlus className="size-4" /> New FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

async function SuperAdminOverview({
  name,
  sites: siteOptions,
}: {
  name: string;
  sites: { id: string; slug: string; name: string }[];
}) {
  const [[siteCount], [userCount], recentActivity] = await Promise.all([
    db.select({ value: count() }).from(sites),
    db.select({ value: count() }).from(users),
    db
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
      .limit(10),
  ]);

  const statCards = [
    { key: "sites", label: "Sites managed", value: siteCount.value, icon: Building2 },
    { key: "users", label: "Users across all sites", value: userCount.value, icon: UsersIcon },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-dark">
          <Building2 className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {name}</h1>
          <p className="text-sm text-slate-500">
            Super Admin Panel — managing {siteCount.value} site{siteCount.value === 1 ? "" : "s"}{" "}
            across the platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 grid size-9 place-items-center rounded-lg bg-accent/10 text-accent-dark">
                <Icon className="size-4.5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Recent activity across all sites
            </h2>
            <Link href="/activity" className="text-sm font-medium text-accent-dark">
              View all
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="grid size-11 place-items-center rounded-full bg-slate-100 text-slate-400">
                <History className="size-5" />
              </div>
              <p className="text-sm text-slate-400">No activity yet across any site.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentActivity.map((a) => (
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
                      {a.siteName && <span className="text-slate-400"> on {a.siteName}</span>}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {a.createdAt.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Quick links
          </h2>
          <ul className="space-y-1 text-sm mb-4">
            <li>
              <Link
                href="/users/new"
                className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-slate-700 transition-colors hover:bg-slate-50 hover:text-accent-dark"
              >
                <UserPlus className="size-4" /> Add a user
              </Link>
            </li>
          </ul>

          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Jump to a site
          </h2>
          <ul className="space-y-1 text-sm">
            {siteOptions.map((s) => (
              <li key={s.id}>
                <SwitchSiteButton siteId={s.id} name={s.name} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
