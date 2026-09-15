import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { Plus, ChevronRight } from "lucide-react";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";

export default async function FaqsPage() {
  const user = await getCurrentUser();
  if (user?.role === "super_admin" && user.activeSiteId === null) redirect("/");
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;

  const rows = siteId
    ? await db.select().from(faqs).where(eq(faqs.siteId, siteId)).orderBy(asc(faqs.order))
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQs"
        description="Manage the frequently asked questions shown on the site."
        action={
          <Link
            href="/faqs/new"
            className="flex items-center gap-1.5 rounded-full accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-accent/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> Add FAQ
          </Link>
        }
      />

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No FAQs yet. Add your first one.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {rows.map((f) => (
            <Link
              key={f.id}
              href={`/faqs/${f.id}`}
              className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-medium text-slate-900">{f.question}</p>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{f.answer}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-slate-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
