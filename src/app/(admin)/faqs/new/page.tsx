import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { createFaqAction } from "../actions";
import { FaqForm } from "../faq-form";

export default async function NewFaqPage() {
  const user = await getCurrentUser();
  if (user?.role === "super_admin" && user.activeSiteId === null) redirect("/");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add FAQ"
        description="Create a new question for the active site."
        backHref="/faqs"
        backLabel="FAQs"
      />
      <FaqForm action={createFaqAction} submitLabel="Create FAQ" />
    </div>
  );
}
