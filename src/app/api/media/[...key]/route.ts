import { NextRequest, NextResponse } from "next/server";
import { getObject } from "@/lib/storage";

// Publicly readable — mirrors the previous behavior of MinIO's own public
// URLs, which served objects to anyone without auth. This route exists so
// browsers/frontends only ever need to reach the admin panel's own HTTPS
// domain, never MinIO's endpoint directly.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const objectKey = key.join("/");

  try {
    const { body, contentType, contentLength } = await getObject(objectKey);

    const headers = new Headers();
    headers.set("Content-Type", contentType ?? "application/octet-stream");
    if (contentLength != null) headers.set("Content-Length", String(contentLength));
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(body, { status: 200, headers });
  } catch (err) {
    console.error(`[api/media] failed to fetch object "${objectKey}":`, err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
