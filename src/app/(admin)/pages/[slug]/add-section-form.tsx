"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import type { SectionState } from "../actions";

const field =
  "rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-light";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function AddSectionForm({
  action,
}: {
  action: (state: SectionState, formData: FormData) => Promise<SectionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-accent/20 hover:opacity-90 transition-opacity"
      >
        <Plus className="size-4" /> Add a content block
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Block name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Hero Banner"
          className={field}
          autoFocus
        />
        <input type="hidden" name="sectionKey" value={slugify(name)} />
        <input type="hidden" name="order" value={99} />
      </div>
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="rounded-full accent-gradient px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {pending ? "Adding..." : "Add"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50"
      >
        Cancel
      </button>
      {state.error && <p className="text-sm text-red-600 w-full">{state.error}</p>}
    </form>
  );
}
