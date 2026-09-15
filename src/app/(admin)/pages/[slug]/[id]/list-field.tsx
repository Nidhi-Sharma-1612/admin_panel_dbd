"use client";

import { Plus, Trash2 } from "lucide-react";

export function ListField({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  function updateItem(index: number, value: string) {
    onChange(items.map((it, i) => (i === index ? value : it)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-light"
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="shrink-0 text-slate-400 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1.5 text-sm font-medium text-accent-dark hover:underline"
      >
        <Plus className="size-3.5" /> Add item
      </button>
    </div>
  );
}
