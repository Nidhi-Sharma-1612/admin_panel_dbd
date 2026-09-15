import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, userSites, sites } from "@/db/schema";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, activeSiteId: string | null) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({ id, userId, activeSiteId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return id;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
  cookieStore.delete(SESSION_COOKIE);
}

// `siteId: null` means "Super Admin Panel" — a super_admin viewing the
// cross-site dashboard instead of any one real site. Regular admins should
// never be set to null; that's enforced by the caller (switchSiteAction).
export async function setActiveSite(siteId: string | null) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return;
  await db.update(sessions).set({ activeSiteId: siteId }).where(eq(sessions.id, sessionId));
}

export type UserRole = "super_admin" | "admin";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  activeSiteId: string | null;
  sites: { id: string; slug: string; name: string }[];
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session || session.expiresAt < new Date()) return null;

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) return null;

  const role: UserRole = user.role === "super_admin" ? "super_admin" : "admin";

  // Super admins (Design by Dial staff) aren't scoped by user_sites — they
  // see and can manage every site that exists, full stop.
  const accessibleSites =
    role === "super_admin"
      ? await db.select({ id: sites.id, slug: sites.slug, name: sites.name }).from(sites)
      : await db
          .select({ id: sites.id, slug: sites.slug, name: sites.name })
          .from(userSites)
          .innerJoin(sites, eq(sites.id, userSites.siteId))
          .where(eq(userSites.userId, user.id));

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role,
    activeSiteId: session.activeSiteId,
    sites: accessibleSites,
  };
}

// True when a super_admin has no real site selected — i.e. they're viewing
// the cross-site Super Admin Panel dashboard rather than one site's content.
export function isSuperAdminPanel(user: Pick<CurrentUser, "role" | "activeSiteId">): boolean {
  return user.role === "super_admin" && user.activeSiteId === null;
}
