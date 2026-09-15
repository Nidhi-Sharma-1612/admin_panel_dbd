import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  action,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-1 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft className="size-3.5" /> {backLabel ?? "Back"}
          </Link>
        )}
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
