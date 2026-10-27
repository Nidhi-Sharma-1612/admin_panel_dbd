"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown, type MarkdownStorage } from "tiptap-markdown";
import {
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Redo2,
  Undo2,
} from "lucide-react";
import type { ImageUploadResult } from "@/lib/media-upload";

declare module "@tiptap/core" {
  interface Storage {
    markdown: MarkdownStorage;
  }
}

const editorClass =
  "min-h-[22rem] rounded-b-lg border border-t-0 border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-accent-light [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_p]:mb-3 [&_a]:text-accent-dark [&_a]:underline [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_ol]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ul]:mb-3 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-slate-400 [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`grid size-8 shrink-0 place-items-center rounded-md transition-colors disabled:opacity-30 ${
        active ? "bg-accent/15 text-accent-dark" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  initialMarkdown,
  onChange,
  onUploadImage,
}: {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  onUploadImage: (formData: FormData) => Promise<ImageUploadResult>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: "Start writing your post…" }),
      Markdown.configure({ html: false, transformPastedText: true }),
    ],
    content: initialMarkdown,
    editorProps: { attributes: { class: editorClass } },
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown());
    },
  });

  // Reflects the initial value once the editor mounts (e.g. loading a post to edit).
  useEffect(() => {
    if (editor && initialMarkdown && editor.isEmpty) {
      editor.commands.setContent(initialMarkdown);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  async function handleImageFile(file: File | undefined) {
    if (!file || !editor) return;
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await onUploadImage(formData);
    setUploading(false);
    if (result.error) {
      setUploadError(result.error);
      return;
    }
    if (result.url) editor.chain().focus().setImage({ src: result.url }).run();
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  if (!editor) {
    return <div className="min-h-[22rem] rounded-lg border border-slate-200 bg-slate-50" />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-slate-200 bg-slate-50 p-1.5">
        <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
        <ToolbarButton
          label="Heading"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Subheading"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
        <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Insert image" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
        <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="size-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => handleImageFile(e.target.files?.[0])}
      />
      {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
    </div>
  );
}
