import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { resolveSiteForRequest } from "@/lib/public-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ site: string }> },
) {
  const { site: siteSlug } = await params;
  const resolved = await resolveSiteForRequest(request, siteSlug);
  if ("error" in resolved) return resolved.error;

  const rows = await db
    .select({ id: faqs.id, question: faqs.question, answer: faqs.answer })
    .from(faqs)
    .where(eq(faqs.siteId, resolved.site.id))
    .orderBy(asc(faqs.order));

  return NextResponse.json(
    { faqs: rows },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } },
  );
}
