import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { resolveSiteForRequest } from "@/lib/public-api";

export async function GET(request: NextRequest, { params }: { params: Promise<{ site: string }> }) {
  const { site: siteSlug } = await params;
  const resolved = await resolveSiteForRequest(request, siteSlug);
  if ("error" in resolved) return resolved.error;

  const rows = await db
    .select({
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      category: articles.category,
      cabins: articles.cabins,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(and(eq(articles.siteId, resolved.site.id), eq(articles.status, "published")))
    .orderBy(desc(articles.publishedAt));

  return NextResponse.json(
    { posts: rows },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } },
  );
}
