"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { uploadSiteImage, type ImageUploadResult } from "@/lib/media-upload";

export type SettingsState = { error?: string; success?: boolean };

export async function uploadLogoAction(formData: FormData): Promise<ImageUploadResult> {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return { error: "No active site." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose a file to upload." };

  return uploadSiteImage({ siteId, userId: user.id, file, keyPrefix: "logo/" });
}

export async function updateSettingsAction(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return { error: "No active site." };

  const values = {
    siteName: String(formData.get("siteName") ?? ""),
    logoUrl: String(formData.get("logoUrl") ?? "") || null,
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    responseTimeNote: String(formData.get("responseTimeNote") ?? ""),
    footerTagline: String(formData.get("footerTagline") ?? ""),
    copyrightName: String(formData.get("copyrightName") ?? ""),
    socialLinks: {
      whatsapp: String(formData.get("social_whatsapp") ?? ""),
      instagram: String(formData.get("social_instagram") ?? ""),
      linkedin: String(formData.get("social_linkedin") ?? ""),
      tiktok: String(formData.get("social_tiktok") ?? ""),
    },
    updatedAt: new Date(),
  };

  await db
    .insert(siteSettings)
    .values({ siteId, ...values })
    .onConflictDoUpdate({ target: siteSettings.siteId, set: values });

  await logActivity({ siteId, userId: user.id, action: "updated", entity: "settings" });

  revalidatePath("/settings");
  return { success: true };
}
