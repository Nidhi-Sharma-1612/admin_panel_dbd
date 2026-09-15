import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { db } from "@/db";
import { users, userSites } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { updateUserAction, deleteUserAction } from "../actions";
import { UserForm } from "../user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "super_admin") redirect("/");
  if (currentUser.activeSiteId !== null) redirect("/");

  const [targetUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!targetUser) notFound();

  const access = await db
    .select({ siteId: userSites.siteId })
    .from(userSites)
    .where(eq(userSites.userId, id));

  const boundUpdate = updateUserAction.bind(null, id);
  const boundDelete = deleteUserAction.bind(null, id);
  const isSelf = currentUser?.id === id;

  return (
    <div className="space-y-6">
      <PageHeader
        title={targetUser.name}
        backHref="/users"
        backLabel="Users"
        action={
          !isSelf && (
            <form action={boundDelete}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-4" /> Remove user
              </button>
            </form>
          )
        }
      />
      <UserForm
        user={{
          name: targetUser.name,
          email: targetUser.email,
          siteIds: access.map((a) => a.siteId),
        }}
        availableSites={currentUser?.sites ?? []}
        action={boundUpdate}
        submitLabel="Save changes"
      />
    </div>
  );
}
