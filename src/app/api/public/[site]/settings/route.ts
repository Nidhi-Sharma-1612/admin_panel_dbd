import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { resolveSiteForRequest } from "@/lib/public-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ site: string }> },
) {
  const { site: siteSlug } = await params;
  const resolved = await resolveSiteForRequest(request, siteSlug);
  if ("error" in resolved) return resolved.error;

  const [settings] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.siteId, resolved.site.id))
    .limit(1);

  return NextResponse.json(
    { settings: settings ?? null },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } },
  );
}
