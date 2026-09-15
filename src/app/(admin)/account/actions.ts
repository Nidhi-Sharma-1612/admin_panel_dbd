"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

export type PasswordState = { error?: string; success?: boolean };

export async function updatePasswordAction(
  _prevState: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in." };

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "New password and confirmation do not match." };

  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  if (!dbUser || !(await verifyPassword(current, dbUser.passwordHash))) {
    return { error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(next);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

  return { success: true };
}
