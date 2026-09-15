"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { pageSections } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { uploadSiteImage, type ImageUploadResult } from "@/lib/media-upload";

export type SectionState = { error?: string };

export async function uploadSectionImageAction(formData: FormData): Promise<ImageUploadResult> {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return { error: "No active site." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose a file to upload." };

  return uploadSiteImage({
    siteId,
    userId: user.id,
    file,
    keyPrefix: "sections/",
    allowVideo: true,
  });
}

export async function createSectionAction(
  pageSlug: string,
  _prevState: SectionState,
  formData: FormData,
): Promise<SectionState> {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return { error: "No active site." };

  const sectionKey = String(formData.get("sectionKey") ?? "").trim();
  const order = formData.get("order") ? Number(formData.get("order")) : 0;
  if (!sectionKey) return { error: "Section key is required." };

  const [created] = await db
    .insert(pageSections)
    .values({ siteId, pageSlug, sectionKey, order, content: {}, updatedBy: user.id })
    .returning({ id: pageSections.id });

  await logActivity({
    siteId,
    userId: user.id,
    action: "created",
    entity: "page_section",
    entityId: `${pageSlug}:${sectionKey}`,
  });

  revalidatePath(`/pages/${pageSlug}`);
  redirect(`/pages/${pageSlug}/${created.id}`);
}

export async function updateSectionContentAction(
  id: string,
  pageSlug: string,
  _prevState: SectionState,
  formData: FormData,
): Promise<SectionState> {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return { error: "No active site." };

  const raw = String(formData.get("contentJson") ?? "{}");
  let content: Record<string, unknown>;
  try {
    content = JSON.parse(raw);
  } catch {
    return { error: "One of the fields contains invalid JSON." };
  }

  await db
    .update(pageSections)
    .set({ content, updatedAt: new Date(), updatedBy: user.id })
    .where(and(eq(pageSections.id, id), eq(pageSections.siteId, siteId)));

  await logActivity({
    siteId,
    userId: user.id,
    action: "updated",
    entity: "page_section",
    entityId: id,
  });

  revalidatePath(`/pages/${pageSlug}`);
  revalidatePath(`/pages/${pageSlug}/${id}`);
  return {};
}

export async function deleteSectionAction(id: string, pageSlug: string) {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return;

  await db
    .delete(pageSections)
    .where(and(eq(pageSections.id, id), eq(pageSections.siteId, siteId)));

  await logActivity({
    siteId,
    userId: user.id,
    action: "deleted",
    entity: "page_section",
    entityId: id,
  });

  revalidatePath(`/pages/${pageSlug}`);
  redirect(`/pages/${pageSlug}`);
}
