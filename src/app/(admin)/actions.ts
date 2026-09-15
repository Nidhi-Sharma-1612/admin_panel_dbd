"use server";

import { redirect } from "next/navigation";
import { destroySession, getCurrentUser, setActiveSite } from "@/lib/auth";

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function switchSiteAction(formData: FormData) {
  const siteId = String(formData.get("siteId") ?? "");
  const user = await getCurrentUser();

  if (user) {
    if (siteId === "") {
      // Empty selection means "Super Admin Panel" — only a super_admin may
      // clear to this no-site state. A regular admin posting this is a no-op.
      if (user.role === "super_admin") {
        await setActiveSite(null);
      }
    } else if (user.sites.some((s) => s.id === siteId)) {
      // Only allow switching to a site this user actually has access to —
      // otherwise a regular admin could post an arbitrary site ID and edit
      // content for a site they were never granted access to.
      await setActiveSite(siteId);
    }
  }
  redirect("/");
}
