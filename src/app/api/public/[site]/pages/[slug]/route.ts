import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pageSections } from "@/db/schema";
import { resolveSiteForRequest } from "@/lib/public-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ site: string; slug: string }> },
) {
  const { site: siteSlug, slug } = await params;
  const resolved = await resolveSiteForRequest(request, siteSlug);
  if ("error" in resolved) return resolved.error;

  const rows = await db
    .select({ sectionKey: pageSections.sectionKey, content: pageSections.content })
    .from(pageSections)
    .where(and(eq(pageSections.siteId, resolved.site.id), eq(pageSections.pageSlug, slug)))
    .orderBy(asc(pageSections.order));

  const sections: Record<string, unknown> = {};
  for (const row of rows) {
    sections[row.sectionKey] = row.content;
  }

  return NextResponse.json(
    { sections },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } },
  );
}
