"use client";

import { useState } from "react";
import { Link2, X } from "lucide-react";

export function PasteLinkButton({
  onSubmit,
  className,
}: {
  onSubmit: (url: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  if (open) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = url.trim();
          if (!trimmed) return;
          onSubmit(trimmed);
          setUrl("");
          setOpen(false);
        }}
        className="flex items-center gap-1.5"
      >
        <input
          autoFocus
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-52 rounded-full border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent-light"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-accent-dark px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          Use link
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setUrl("");
          }}
          aria-label="Cancel"
          className="shrink-0 text-slate-400 hover:text-slate-600"
        >
          <X className="size-3.5" />
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={
        className ??
        "flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      }
    >
      <Link2 className="size-3.5" /> Paste link
    </button>
  );
}
