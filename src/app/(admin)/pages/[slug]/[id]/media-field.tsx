"use client";

import { useRef, useState } from "react";
import { ImageOff, Trash2, Upload } from "lucide-react";
import { uploadSectionImageAction } from "../../actions";

const VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|mov)(\?.*)?$/i;

function isVideoUrl(url: string): boolean {
  return VIDEO_EXTENSION_PATTERN.test(url);
}

export function MediaField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadSectionImageAction(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url) onChange(result.url);
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-start gap-3">
          {isVideoUrl(value) ? (
            <video
              src={value}
              muted
              loop
              autoPlay
              playsInline
              className="h-28 w-48 shrink-0 rounded-lg border border-slate-200 object-cover bg-slate-50"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-28 w-48 shrink-0 rounded-lg border border-slate-200 object-cover bg-slate-50"
            />
          )}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-400">
              Currently used {isVideoUrl(value) ? "video" : "image"}
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              <Upload className="size-3.5" /> {pending ? "Uploading..." : "Replace"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="flex h-20 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 hover:border-accent hover:text-accent-dark disabled:opacity-60"
        >
          {pending ? (
            "Uploading..."
          ) : (
            <>
              <ImageOff className="size-4" /> Upload an image or video
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
