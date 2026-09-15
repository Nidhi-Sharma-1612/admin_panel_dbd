import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { ChevronRight, Trash2 } from "lucide-react";
import { db } from "@/db";
import { pages, pageSections } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { humanizeKey } from "@/lib/humanize";
import { createSectionAction, updateSectionContentAction, deleteSectionAction } from "../actions";
import { AddSectionForm } from "./add-section-form";
import { SectionEditor } from "./[id]/section-editor";

export default async function PageSectionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (user?.role === "super_admin" && user.activeSiteId === null) redirect("/");
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;

  if (!siteId) notFound();

  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.siteId, siteId), eq(pages.slug, slug)))
    .limit(1);

  if (!page) notFound();

  const sections = await db
    .select()
    .from(pageSections)
    .where(and(eq(pageSections.siteId, siteId), eq(pageSections.pageSlug, slug)))
    .orderBy(asc(pageSections.order));

  const boundCreate = createSectionAction.bind(null, slug);

  // With only one block on this page, skip the intermediate list — there's
  // nothing to choose between, so show its fields directly.
  if (sections.length === 1) {
    const section = sections[0];
    const boundUpdate = updateSectionContentAction.bind(null, section.id, slug);
    const boundDelete = deleteSectionAction.bind(null, section.id, slug);

    return (
      <div className="space-y-6">
        <PageHeader
          title={page.title}
          description="Edit the content below, and see the changes on your live site."
          backHref="/pages"
          backLabel="Pages"
          action={
            <div className="flex items-center gap-2">
              <AddSectionForm action={boundCreate} />
              <form action={boundDelete}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-4" /> Remove this block
                </button>
              </form>
            </div>
          }
        />

        <SectionEditor initialContent={section.content ?? {}} action={boundUpdate} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={page.title}
        description="Click a block below to edit its text, and see the changes on your live site."
        backHref="/pages"
        backLabel="Pages"
        action={<AddSectionForm action={boundCreate} />}
      />

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No sections yet for this page.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {sections.map((s) => (
            <Link
              key={s.id}
              href={`/pages/${slug}/${s.id}`}
              className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-medium text-slate-900">{humanizeKey(s.sectionKey)}</p>
                <p className="text-xs text-slate-400">
                  Last edited {s.updatedAt.toLocaleDateString()}
                </p>
              </div>
              <ChevronRight className="size-4 text-slate-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
