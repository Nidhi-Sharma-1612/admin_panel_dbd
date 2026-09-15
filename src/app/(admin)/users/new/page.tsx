import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { createUserAction } from "../actions";
import { UserForm } from "../user-form";

export default async function NewUserPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "super_admin") redirect("/");
  if (currentUser.activeSiteId !== null) redirect("/");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add user"
        description="Create a login for someone else to help manage your sites."
        backHref="/users"
        backLabel="Users"
      />
      <UserForm
        availableSites={currentUser?.sites ?? []}
        action={createUserAction}
        submitLabel="Create user"
      />
    </div>
  );
}
