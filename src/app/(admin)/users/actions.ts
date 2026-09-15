"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users, userSites } from "@/db/schema";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export type UserFormState = { error?: string };

function getSelectedSiteIds(formData: FormData): string[] {
  return formData.getAll("siteIds").map(String).filter(Boolean);
}

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Not authenticated." };
  if (currentUser.role !== "super_admin") return { error: "Not authorized." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const siteIds = getSelectedSiteIds(formData);

  if (!name || !email) return { error: "Name and email are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  if (siteIds.length === 0) return { error: "Select at least one site for this user." };

  // Only grant access to sites the person creating the user can themselves manage.
  const allowedSiteIds = new Set(currentUser.sites.map((s) => s.id));
  const grantSiteIds = siteIds.filter((id) => allowedSiteIds.has(id));
  if (grantSiteIds.length === 0) return { error: "Select at least one site for this user." };

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { error: "A user with this email already exists." };

  const passwordHash = await hashPassword(password);
  const [created] = await db.insert(users).values({ name, email, passwordHash }).returning();

  await db.insert(userSites).values(grantSiteIds.map((sid) => ({ userId: created.id, siteId: sid })));

  await logActivity({
    siteId: grantSiteIds[0],
    userId: currentUser.id,
    action: "created",
    entity: "user",
    entityId: email,
  });

  revalidatePath("/users");
  redirect("/users");
}

export async function updateUserAction(
  id: string,
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Not authenticated." };
  if (currentUser.role !== "super_admin") return { error: "Not authorized." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const siteIds = getSelectedSiteIds(formData);

  if (!name || !email) return { error: "Name and email are required." };
  if (password && password.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (password && password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  if (siteIds.length === 0) return { error: "Select at least one site for this user." };

  const [emailOwner] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (emailOwner && emailOwner.id !== id) {
    return { error: "A user with this email already exists." };
  }

  const updateValues: { name: string; email: string; passwordHash?: string } = { name, email };
  if (password) updateValues.passwordHash = await hashPassword(password);

  await db.update(users).set(updateValues).where(eq(users.id, id));

  // Only let the editor change access to sites they themselves can manage —
  // access to any other site this user has stays untouched.
  const allowedSiteIds = new Set(currentUser.sites.map((s) => s.id));
  const desiredWithinAllowed = siteIds.filter((sid) => allowedSiteIds.has(sid));

  const existingAccess = await db
    .select({ siteId: userSites.siteId })
    .from(userSites)
    .where(and(eq(userSites.userId, id), inArray(userSites.siteId, [...allowedSiteIds])));
  const existingIds = new Set(existingAccess.map((r) => r.siteId));

  const toAdd = desiredWithinAllowed.filter((sid) => !existingIds.has(sid));
  const toRemove = [...existingIds].filter((sid) => !desiredWithinAllowed.includes(sid));

  if (toAdd.length > 0) {
    await db.insert(userSites).values(toAdd.map((sid) => ({ userId: id, siteId: sid })));
  }
  if (toRemove.length > 0) {
    await db
      .delete(userSites)
      .where(and(eq(userSites.userId, id), inArray(userSites.siteId, toRemove)));
  }

  const logSiteId = desiredWithinAllowed[0] ?? currentUser.sites[0]?.id;
  if (logSiteId) {
    await logActivity({
      siteId: logSiteId,
      userId: currentUser.id,
      action: "updated",
      entity: "user",
      entityId: email,
    });
  }

  revalidatePath("/users");
  revalidatePath(`/users/${id}`);
  return {};
}

export async function deleteUserAction(id: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;
  if (currentUser.role !== "super_admin") return;
  if (currentUser.id === id) return;

  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const [existingAccess] = await db
    .select({ siteId: userSites.siteId })
    .from(userSites)
    .where(eq(userSites.userId, id))
    .limit(1);
  const logSiteId = existingAccess?.siteId ?? currentUser.sites[0]?.id;

  await db.delete(users).where(eq(users.id, id));

  if (target && logSiteId) {
    await logActivity({
      siteId: logSiteId,
      userId: currentUser.id,
      action: "deleted",
      entity: "user",
      entityId: target.email,
    });
  }

  revalidatePath("/users");
  redirect("/users");
}
