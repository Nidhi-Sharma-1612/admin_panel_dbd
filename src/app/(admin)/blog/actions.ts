"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { uploadSiteImage, type ImageUploadResult } from "@/lib/media-upload";

export type ArticleState = { error?: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseArticleForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const cabinsRaw = String(formData.get("cabins") ?? "").trim();
  return {
    title,
    slug: slugify(slugInput || title),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body: String(formData.get("body") ?? ""),
    coverImage: String(formData.get("coverImage") ?? "").trim() || null,
    heroImage: String(formData.get("heroImage") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim() || null,
    cabins: cabinsRaw
      ? cabinsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    status: formData.get("status") === "published" ? "published" : "draft",
  };
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "23505";
}

export async function createArticleAction(
  _prevState: ArticleState,
  formData: FormData,
): Promise<ArticleState> {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return { error: "No active site." };

  const values = parseArticleForm(formData);
  if (!values.title) return { error: "Title is required." };
  if (!values.slug) return { error: "Slug is required." };
  if (!values.body.trim()) return { error: "Post content is required." };

  let id: string;
  try {
    const [row] = await db
      .insert(articles)
      .values({
        siteId,
        ...values,
        publishedAt: values.status === "published" ? new Date() : null,
      })
      .returning({ id: articles.id });
    id = row.id;
  } catch (err) {
    if (isUniqueViolation(err)) return { error: "That slug is already used by another post." };
    throw err;
  }

  await logActivity({ siteId, userId: user.id, action: "created", entity: "article", entityId: id });

  revalidatePath("/blog");
  redirect("/blog");
}

export async function updateArticleAction(
  id: string,
  _prevState: ArticleState,
  formData: FormData,
): Promise<ArticleState> {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return { error: "No active site." };

  const values = parseArticleForm(formData);
  if (!values.title) return { error: "Title is required." };
  if (!values.slug) return { error: "Slug is required." };
  if (!values.body.trim()) return { error: "Post content is required." };

  const [existing] = await db
    .select({ status: articles.status, publishedAt: articles.publishedAt })
    .from(articles)
    .where(and(eq(articles.id, id), eq(articles.siteId, siteId)))
    .limit(1);
  if (!existing) return { error: "Post not found." };

  const publishedAt =
    values.status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt;

  try {
    await db
      .update(articles)
      .set({ ...values, publishedAt, updatedAt: new Date() })
      .where(and(eq(articles.id, id), eq(articles.siteId, siteId)));
  } catch (err) {
    if (isUniqueViolation(err)) return { error: "That slug is already used by another post." };
    throw err;
  }

  await logActivity({ siteId, userId: user.id, action: "updated", entity: "article", entityId: id });

  revalidatePath("/blog");
  redirect("/blog");
}

export async function deleteArticleAction(id: string) {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return;

  await db.delete(articles).where(and(eq(articles.id, id), eq(articles.siteId, siteId)));
  await logActivity({ siteId, userId: user.id, action: "deleted", entity: "article", entityId: id });

  revalidatePath("/blog");
  redirect("/blog");
}

export async function uploadArticleImageAction(formData: FormData): Promise<ImageUploadResult> {
  const user = await getCurrentUser();
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;
  if (!user || !siteId) return { error: "No active site." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose a file to upload." };

  return uploadSiteImage({ siteId, userId: user.id, file, keyPrefix: "blog/" });
}
