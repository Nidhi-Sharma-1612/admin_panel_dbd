"use client";

import { useActionState, useMemo, useState } from "react";
import { ChevronDown, Plus, Settings2, Trash2 } from "lucide-react";
import type { SectionState } from "../../actions";
import { MediaField } from "./media-field";
import { ListField } from "./list-field";
import { ObjectListField } from "./object-list-field";
import { humanizeKey } from "@/lib/humanize";
import { useSubmitToast } from "@/components/toast";

type FieldKind = "text" | "textarea" | "list" | "objectList" | "json" | "media";

type FieldRow = {
  id: string;
  key: string;
  kind: FieldKind;
  value: string;
  itemKeys?: string[];
};

const MEDIA_URL_PATTERN = /\.(png|jpe?g|gif|webp|svg|mp4|webm|mov)(\?.*)?$/i;
const MEDIA_KEY_PATTERN = /(image|photo|logo|thumbnail|avatar|picture|banner|video|media)/i;

function looksLikeMediaUrl(key: string, value: string): boolean {
  return (
    (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) &&
    (MEDIA_URL_PATTERN.test(value) || MEDIA_KEY_PATTERN.test(key))
  );
}

function isFlatObject(value: unknown): value is Record<string, string | number> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => typeof v === "string" || typeof v === "number")
  );
}

function inferField(key: string, value: unknown): FieldRow {
  const id = Math.random().toString(36).slice(2);
  if (typeof value === "string") {
    if (looksLikeMediaUrl(key, value)) {
      return { id, key, kind: "media", value };
    }
    return { id, key, kind: value.length > 80 ? "textarea" : "text", value };
  }
  if (typeof value === "number") {
    return { id, key, kind: "text", value: String(value) };
  }
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return { id, key, kind: "list", value: JSON.stringify(value) };
  }
  if (Array.isArray(value) && value.length > 0 && value.every(isFlatObject)) {
    const itemKeys = Array.from(new Set(value.flatMap((v) => Object.keys(v as object))));
    return { id, key, kind: "objectList", value: JSON.stringify(value), itemKeys };
  }
  return { id, key, kind: "json", value: JSON.stringify(value ?? null, null, 2) };
}

function fieldsToObject(fields: FieldRow[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const f of fields) {
    if (!f.key.trim()) continue;
    if (f.kind === "text" || f.kind === "textarea" || f.kind === "media") {
      obj[f.key] = f.value;
    } else if (f.kind === "list" || f.kind === "objectList") {
      try {
        obj[f.key] = JSON.parse(f.value || "[]");
      } catch {
        obj[f.key] = [];
      }
    } else {
      try {
        obj[f.key] = JSON.parse(f.value || "null");
      } catch {
        obj[f.key] = f.value;
      }
    }
  }
  return obj;
}

const inputClass =
  "w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-light";

export function SectionEditor({
  initialContent,
  action,
}: {
  initialContent: Record<string, unknown>;
  action: (state: SectionState, formData: FormData) => Promise<SectionState>;
}) {
  const [fields, setFields] = useState<FieldRow[]>(() =>
    Object.entries(initialContent).map(([k, v]) => inferField(k, v)),
  );
  const [advanced, setAdvanced] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newKind, setNewKind] = useState<FieldKind>("text");
  const [state, formAction, pending] = useActionState(action, {});
  useSubmitToast(pending, state.error, "Changes saved.");

  const contentJson = useMemo(() => JSON.stringify(fieldsToObject(fields)), [fields]);

  function updateField(id: string, patch: Partial<FieldRow>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function addField() {
    if (!newKey.trim()) return;
    setFields((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        key: newKey.trim(),
        kind: newKind,
        value: newKind === "json" ? "null" : newKind === "list" || newKind === "objectList" ? "[]" : "",
        itemKeys: newKind === "objectList" ? [] : undefined,
      },
    ]);
    setNewKey("");
    setNewKind("text");
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="contentJson" value={contentJson} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        {fields.length === 0 && (
          <p className="text-sm text-slate-400">
            This block has no content yet. Use &ldquo;Manage fields&rdquo; below to add some.
          </p>
        )}

        {fields.map((f) => (
          <div key={f.id} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3 sm:items-start">
            <div className="sm:w-36 sm:shrink-0 sm:pt-2.5">
              <p className="text-sm font-medium text-slate-700 wrap-break-word">
                {humanizeKey(f.key)}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              {f.kind === "text" && (
                <input
                  value={f.value}
                  onChange={(e) => updateField(f.id, { value: e.target.value })}
                  className={inputClass}
                />
              )}
              {f.kind === "textarea" && (
                <textarea
                  rows={3}
                  value={f.value}
                  onChange={(e) => updateField(f.id, { value: e.target.value })}
                  className={inputClass}
                />
              )}
              {f.kind === "list" && (
                <ListField
                  items={JSON.parse(f.value || "[]")}
                  onChange={(items) => updateField(f.id, { value: JSON.stringify(items) })}
                />
              )}
              {f.kind === "objectList" && (
                <ObjectListField
                  items={JSON.parse(f.value || "[]")}
                  itemKeys={f.itemKeys ?? []}
                  onChange={(items) => updateField(f.id, { value: JSON.stringify(items) })}
                />
              )}
              {f.kind === "json" && (
                <textarea
                  rows={6}
                  value={f.value}
                  onChange={(e) => updateField(f.id, { value: e.target.value })}
                  className={`${inputClass} font-mono text-xs`}
                />
              )}
              {f.kind === "media" && (
                <MediaField
                  value={f.value}
                  onChange={(url) => updateField(f.id, { value: url })}
                />
              )}
            </div>
            {advanced && (
              <button
                type="button"
                onClick={() => removeField(f.id)}
                className="mt-2.5 text-slate-400 hover:text-red-600"
                title="Remove this field"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent/20 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>

        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          <Settings2 className="size-3.5" />
          Manage fields
          <ChevronDown className={`size-3.5 transition-transform ${advanced ? "rotate-180" : ""}`} />
        </button>
      </div>

      {advanced && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <p className="mb-3 text-xs text-slate-500">
            Advanced: add a brand-new field to this block. Most edits don&apos;t need this —
            just fill in the fields above.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="New field name"
              className={`${inputClass} max-w-xs`}
            />
            <select
              value={newKind}
              onChange={(e) => setNewKind(e.target.value as FieldKind)}
              className={inputClass}
            >
              <option value="text">Short text</option>
              <option value="textarea">Long text</option>
              <option value="list">List of items</option>
              <option value="media">Image or Video</option>
            </select>
            <button
              type="button"
              onClick={addField}
              disabled={!newKey.trim()}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="size-4" /> Add field
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
