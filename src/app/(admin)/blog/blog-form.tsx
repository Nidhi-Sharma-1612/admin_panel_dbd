"use client";

import { useActionState, useState } from "react";
import { ChevronDown, Newspaper, Settings2 } from "lucide-react";
import type { ArticleState } from "./actions";
import { uploadArticleImageAction } from "./actions";
import { RichTextEditor } from "./rich-text-editor";
import { useSubmitToast } from "@/components/toast";
import { MediaField } from "@/components/media-field";

type Article = {
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  heroImage: string | null;
  category: string | null;
  cabins: string[];
  status: string;
} | undefined;

const field =
  "w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-light";
const label = "block text-sm font-medium text-slate-700 mb-1";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BlogForm({
  article,
  action,
  submitLabel,
}: {
  article?: Article;
  action: (state: ArticleState, formData: FormData) => Promise<ArticleState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  useSubmitToast(pending, state.error, article ? "Post saved." : "Post created.");

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [heroImage, setHeroImage] = useState(article?.heroImage ?? "");
  const [category, setCategory] = useState(article?.category ?? "");
  const [cabins, setCabins] = useState((article?.cabins ?? []).join(", "));
  const [status, setStatus] = useState(article?.status ?? "draft");
  const [advanced, setAdvanced] = useState(false);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <input type="hidden" name="cabins" value={cabins} />

      <div className="space-y-6 xl:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-dark">
              <Newspaper className="size-4.5" />
            </div>
            <p className="text-sm text-slate-500">
              The title, post URL and short summary shown in the guide&apos;s article list.
            </p>
          </div>

          <div>
            <label className={label}>Title</label>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g. The Best Time to Visit the Smokies"
              className={field}
            />
          </div>
          <div>
            <label className={label}>URL slug</label>
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={`${field} font-mono text-xs`}
            />
            <p className="mt-1 text-xs text-slate-400">
              The page will be at /smoky-mountain-guide/{slug || "..."}
            </p>
          </div>
          <div>
            <label className={label}>Excerpt</label>
            <textarea
              name="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short summary shown on the article list card"
              className={field}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
          <label className={label}>Post content</label>
          <RichTextEditor initialMarkdown={body} onChange={setBody} onUploadImage={uploadArticleImageAction} />
          <input type="hidden" name="body" value={body} />
          {!body.trim() && <p className="text-xs text-red-500">Write something before saving.</p>}
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent/20 disabled:opacity-60"
          >
            {pending ? "Saving..." : submitLabel}
          </button>
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            <Settings2 className="size-3.5" />
            Advanced
            <ChevronDown className={`size-3.5 transition-transform ${advanced ? "rotate-180" : ""}`} />
          </button>
        </div>

        {advanced && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <label className={label}>Related cabins</label>
            <input
              value={cabins}
              onChange={(e) => setCabins(e.target.value)}
              placeholder="emerald-forest, firefly-bungalow-2"
              className={field}
            />
            <p className="mt-1 text-xs text-slate-400">
              Comma-separated cabin slugs, cross-promoted at the end of the post.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div>
            <label className={label}>Status</label>
            <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
              <option value="draft">Draft (not shown on the site)</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className={label}>Category</label>
            <input
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. The Smokies by Season"
              className={field}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
          <label className={label}>Cover image</label>
          <p className="-mt-1 text-xs text-slate-400">Shown on the article list card.</p>
          <MediaField value={coverImage} onUpload={uploadArticleImageAction} onChange={setCoverImage} />
          <input type="hidden" name="coverImage" value={coverImage} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
          <label className={label}>Hero image</label>
          <p className="-mt-1 text-xs text-slate-400">The large image at the top of the post itself.</p>
          <MediaField value={heroImage} onUpload={uploadArticleImageAction} onChange={setHeroImage} />
          <input type="hidden" name="heroImage" value={heroImage} />
        </div>
      </div>
    </form>
  );
}
