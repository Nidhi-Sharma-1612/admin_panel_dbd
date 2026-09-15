import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { db } from "@/db";
import { pageSections } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { humanizeKey } from "@/lib/humanize";
import { updateSectionContentAction, deleteSectionAction } from "../../actions";
import { SectionEditor } from "./section-editor";

export default async function SectionEditPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const [section] = await db.select().from(pageSections).where(eq(pageSections.id, id)).limit(1);

  if (!section) notFound();

  const boundUpdate = updateSectionContentAction.bind(null, id, slug);
  const boundDelete = deleteSectionAction.bind(null, id, slug);

  return (
    <div className="space-y-6">
      <PageHeader
        title={humanizeKey(section.sectionKey)}
        backHref={`/pages/${slug}`}
        backLabel={humanizeKey(slug)}
        action={
          <form action={boundDelete}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" /> Remove this block
            </button>
          </form>
        }
      />

      <SectionEditor initialContent={section.content ?? {}} action={boundUpdate} />
    </div>
  );
}
