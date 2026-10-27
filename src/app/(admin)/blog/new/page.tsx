import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { createArticleAction } from "../actions";
import { BlogForm } from "../blog-form";

export default async function NewArticlePage() {
  const user = await getCurrentUser();
  if (user?.role === "super_admin" && user.activeSiteId === null) redirect("/");

  return (
    <div className="space-y-6">
      <PageHeader
        title="New post"
        description="Write a new Smoky Mountain Guide article for the active site."
        backHref="/blog"
        backLabel="Smoky Mountain Guide"
      />
      <BlogForm action={createArticleAction} submitLabel="Create post" />
    </div>
  );
}
