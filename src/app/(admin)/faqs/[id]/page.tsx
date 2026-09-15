import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { updateFaqAction, deleteFaqAction } from "../actions";
import { FaqForm } from "../faq-form";

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (user?.role === "super_admin" && user.activeSiteId === null) redirect("/");
  const [faq] = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);

  if (!faq) notFound();

  const boundUpdate = updateFaqAction.bind(null, id);
  const boundDelete = deleteFaqAction.bind(null, id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit FAQ"
        backHref="/faqs"
        backLabel="FAQs"
        action={
          <form action={boundDelete}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" /> Delete
            </button>
          </form>
        }
      />
      <FaqForm faq={faq} action={boundUpdate} submitLabel="Save changes" />
    </div>
  );
}
