"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { switchSiteAction } from "./actions";

export function SwitchSiteButton({ siteId, name }: { siteId: string; name: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        const fd = new FormData();
        fd.set("siteId", siteId);
        startTransition(async () => {
          try {
            await switchSiteAction(fd);
          } finally {
            // Jumping to a site redirects to "/" — the same route this
            // button lives on, so the router won't refetch on its own.
            router.refresh();
          }
        });
      }}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-left text-slate-700 transition-colors hover:bg-slate-50 hover:text-accent-dark"
    >
      <Building2 className="size-4" /> {name}
    </button>
  );
}
