import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ChevronRight, Layers } from "lucide-react";
import { db } from "@/db";
import { pages, pageSections } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";

export default async function PagesPage() {
  const user = await getCurrentUser();
  if (user?.role === "super_admin" && user.activeSiteId === null) redirect("/");
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;

  const pageRows = siteId
    ? await db.select().from(pages).where(eq(pages.siteId, siteId)).orderBy(asc(pages.order))
    : [];

  const sectionRows = siteId
    ? await db
        .select({ pageSlug: pageSections.pageSlug })
        .from(pageSections)
        .where(eq(pageSections.siteId, siteId))
    : [];

  const counts = sectionRows.reduce<Record<string, number>>((acc, row) => {
    acc[row.pageSlug] = (acc[row.pageSlug] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pages"
        description="Edit the content blocks that make up each marketing page — no code deploy needed."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageRows.map((p) => (
          <Link
            key={p.slug}
            href={`/pages/${p.slug}`}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-accent/40 hover:shadow-md"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-dark">
              <Layers className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{p.title}</p>
              <p className="text-sm text-slate-500">
                {counts[p.slug] ?? 0} editable section{counts[p.slug] === 1 ? "" : "s"}
              </p>
            </div>
            <ChevronRight className="size-4 text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
