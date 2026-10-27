import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { resolveSiteForRequest } from "@/lib/public-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ site: string; slug: string }> },
) {
  const { site: siteSlug, slug } = await params;
  const resolved = await resolveSiteForRequest(request, siteSlug);
  if ("error" in resolved) return resolved.error;

  const [post] = await db
    .select()
    .from(articles)
    .where(
      and(
        eq(articles.siteId, resolved.site.id),
        eq(articles.slug, slug),
        eq(articles.status, "published"),
      ),
    )
    .limit(1);

  if (!post) return NextResponse.json({ post: null }, { status: 404 });

  return NextResponse.json(
    { post },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } },
  );
}
