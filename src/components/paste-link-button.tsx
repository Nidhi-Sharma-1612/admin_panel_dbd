"use client";

import { useState } from "react";
import { ImageOff, Link2, X } from "lucide-react";

export function PasteLinkButton({
  onSubmit,
  className,
}: {
  onSubmit: (url: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);

  if (open) {
    // A plain <div>, not a <form> — this renders inside the section
    // editor's own outer <form>, and HTML doesn't allow nested forms (the
    // browser silently drops a nested one), which would submit the whole
    // outer form instead of running this field's own submit logic.
    const submit = () => {
      const trimmed = url.trim();
      if (!trimmed) return;
      onSubmit(trimmed);
      setUrl("");
      setOpen(false);
    };

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setPreviewFailed(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="https://..."
            className="w-52 rounded-full border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent-light"
          />
          <button
            type="button"
            onClick={submit}
            className="shrink-0 rounded-full bg-accent-dark px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Use link
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setUrl("");
              setPreviewFailed(false);
            }}
            aria-label="Cancel"
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {url.trim() &&
          (previewFailed ? (
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <ImageOff className="size-3.5" /> Couldn&apos;t load a preview for this link.
            </p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url.trim()}
              alt="Preview"
              onError={() => setPreviewFailed(true)}
              className="h-20 w-32 rounded-lg border border-slate-200 object-cover bg-slate-50"
            />
          ))}
      </div>
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
