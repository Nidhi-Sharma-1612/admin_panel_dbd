"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export type FaqState = { error?: string };

function parseFaqForm(formData: FormData) {
  return {
    question: String(formData.get("question") ?? "").trim(),
    answer: String(formData.get("answer") ?? "").trim(),
    order: formData.get("order") ? Number(formData.get("order")) : 0,
  };
}

export async function createFaqAction(
  _prevState: FaqState,
  formData: FormData,
): Promise<FaqState> {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return { error: "No active site." };

  const values = parseFaqForm(formData);
  if (!values.question || !values.answer) return { error: "Question and answer are required." };

  await db.insert(faqs).values({ siteId, ...values });

  await logActivity({ siteId, userId: user.id, action: "created", entity: "faq" });

  revalidatePath("/faqs");
  redirect("/faqs");
}

export async function updateFaqAction(
  id: string,
  _prevState: FaqState,
  formData: FormData,
): Promise<FaqState> {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return { error: "No active site." };

  const values = parseFaqForm(formData);
  if (!values.question || !values.answer) return { error: "Question and answer are required." };

  await db.update(faqs).set(values).where(and(eq(faqs.id, id), eq(faqs.siteId, siteId)));

  await logActivity({ siteId, userId: user.id, action: "updated", entity: "faq" });

  revalidatePath("/faqs");
  redirect("/faqs");
}

export async function deleteFaqAction(id: string) {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return;

  await db.delete(faqs).where(and(eq(faqs.id, id), eq(faqs.siteId, siteId)));
  await logActivity({ siteId, userId: user.id, action: "deleted", entity: "faq" });

  revalidatePath("/faqs");
  redirect("/faqs");
}
