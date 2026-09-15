"use client";

import { Plus, Trash2 } from "lucide-react";
import { humanizeKey } from "@/lib/humanize";

type ObjectItem = Record<string, string>;

export function ObjectListField({
  items,
  itemKeys,
  onChange,
}: {
  items: ObjectItem[];
  itemKeys: string[];
  onChange: (items: ObjectItem[]) => void;
}) {
  function updateItem(index: number, key: string, value: string) {
    onChange(items.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    const blank = Object.fromEntries(itemKeys.map((k) => [k, ""]));
    onChange([...items, blank]);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Item {i + 1}
            </p>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-slate-400 hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          {itemKeys.map((key) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {humanizeKey(key)}
              </label>
              {(item[key]?.length ?? 0) > 80 ? (
                <textarea
                  rows={3}
                  value={item[key] ?? ""}
                  onChange={(e) => updateItem(i, key, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-light"
                />
              ) : (
                <input
                  value={item[key] ?? ""}
                  onChange={(e) => updateItem(i, key, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-light"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm font-medium text-accent-dark hover:underline"
      >
        <Plus className="size-3.5" /> Add item
      </button>
    </div>
  );
}
