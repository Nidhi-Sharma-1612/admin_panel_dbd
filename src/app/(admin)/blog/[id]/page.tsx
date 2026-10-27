import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink, Trash2 } from "lucide-react";
import { db } from "@/db";
import { articles, sites } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { updateArticleAction, deleteArticleAction } from "../actions";
import { BlogForm } from "../blog-form";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (user?.role === "super_admin" && user.activeSiteId === null) redirect("/");

  const [article] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!article) notFound();

  const [site] = await db.select({ frontendUrl: sites.frontendUrl, domain: sites.domain }).from(sites).where(eq(sites.id, article.siteId)).limit(1);
  const base = site?.frontendUrl || (site?.domain ? `https://${site.domain}` : null);

  const boundUpdate = updateArticleAction.bind(null, id);
  const boundDelete = deleteArticleAction.bind(null, id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit post"
        backHref="/blog"
        backLabel="Smoky Mountain Guide"
        action={
          <div className="flex items-center gap-2">
            {base && article.status === "published" && (
              <a
                href={`${base}/smoky-mountain-guide/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <ExternalLink className="size-4" /> View live
              </a>
            )}
            <form action={boundDelete}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-4" /> Delete
              </button>
            </form>
          </div>
        }
      />
      <BlogForm article={article} action={boundUpdate} submitLabel="Save changes" />
    </div>
  );
}
