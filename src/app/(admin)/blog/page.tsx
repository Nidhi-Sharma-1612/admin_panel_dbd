import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { Plus, ChevronRight, FileText } from "lucide-react";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";

export default async function BlogPage() {
  const user = await getCurrentUser();
  if (user?.role === "super_admin" && user.activeSiteId === null) redirect("/");
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;

  const rows = siteId
    ? await db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          status: articles.status,
          coverImage: articles.coverImage,
          category: articles.category,
          updatedAt: articles.updatedAt,
        })
        .from(articles)
        .where(eq(articles.siteId, siteId))
        .orderBy(desc(articles.updatedAt))
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smoky Mountain Guide"
        description="Write, publish and remove blog posts shown on the site."
        action={
          <Link
            href="/blog/new"
            className="flex items-center gap-1.5 rounded-full accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-accent/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> New post
          </Link>
        }
      />

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No posts yet. Write your first one.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {rows.map((a) => (
            <Link
              key={a.id}
              href={`/blog/${a.id}`}
              className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                  {a.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.coverImage} alt="" className="size-full object-cover" />
                  ) : (
                    <FileText className="size-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{a.title}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-sm text-slate-500">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        a.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {a.status === "published" ? "Published" : "Draft"}
                    </span>
                    {a.category && <span>{a.category}</span>}
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-slate-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
