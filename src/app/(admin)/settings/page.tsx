import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (user?.role === "super_admin" && user.activeSiteId === null) redirect("/");
  const siteId = user?.activeSiteId ?? user?.sites[0]?.id;

  const [settings] = siteId
    ? await db.select().from(siteSettings).where(eq(siteSettings.siteId, siteId)).limit(1)
    : [undefined];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Your logo, site name, contact details, and social links — used across the navbar, footer, contact page, and WhatsApp links site-wide."
      />

      <SettingsForm settings={settings} />
    </div>
  );
}
