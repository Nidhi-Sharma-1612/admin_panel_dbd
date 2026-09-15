import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { sites, apiKeys } from "@/db/schema";

export async function resolveSiteForRequest(request: NextRequest, siteSlug: string) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return { error: NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 }) };
  }

  const [site] = await db.select().from(sites).where(eq(sites.slug, siteSlug)).limit(1);
  if (!site) {
    return { error: NextResponse.json({ error: "Unknown site" }, { status: 404 }) };
  }

  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.siteId, site.id), eq(apiKeys.key, apiKey), eq(apiKeys.revoked, false)))
    .limit(1);

  if (!key) {
    return { error: NextResponse.json({ error: "Invalid API key for this site" }, { status: 403 }) };
  }

  return { site };
}
