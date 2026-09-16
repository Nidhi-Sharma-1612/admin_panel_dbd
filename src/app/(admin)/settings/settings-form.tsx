"use client";

import { useActionState, useState } from "react";
import { Building2, Contact, PanelBottom, Share2 } from "lucide-react";
import { updateSettingsAction, type SettingsState } from "./actions";
import { LogoField } from "./logo-field";
import { useSubmitToast } from "@/components/toast";

type Settings = {
  siteName?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  responseTimeNote?: string | null;
  footerTagline?: string | null;
  copyrightName?: string | null;
  socialLinks?: Record<string, string> | null;
} | undefined;

const initialState: SettingsState = {};

const field =
  "w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-light";
const label = "block text-sm font-medium text-slate-700 mb-1";

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-dark">
        <Icon className="size-4" />
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
    </div>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);
  useSubmitToast(pending, state.error, "Settings saved.");
  const social = settings?.socialLinks ?? {};
  const [siteName, setSiteName] = useState(settings?.siteName ?? "");
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl ?? "");

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <input type="hidden" name="logoUrl" value={logoUrl} />

      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <SectionHeading icon={Building2} title="Site identity" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
            <div>
              <label className={label}>Logo</label>
              <LogoField value={logoUrl} onChange={setLogoUrl} />
            </div>
            <div>
              <label className={label}>Site name</label>
              <input
                name="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className={field}
              />
              <p className="mt-1 text-xs text-slate-400">Shown in the navbar and footer.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-xs font-semibold text-slate-400">
                  {siteName.charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-slate-700">
              {siteName || "Your site name"}
            </span>
            <span className="ml-auto text-xs text-slate-400">Preview</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <SectionHeading icon={Contact} title="Contact details" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Phone (display format)</label>
              <input name="phone" defaultValue={settings?.phone ?? ""} className={field} />
            </div>
            <div>
              <label className={label}>WhatsApp number</label>
              <input name="whatsapp" defaultValue={settings?.whatsapp ?? ""} className={field} />
              <p className="mt-1 text-xs text-slate-400">Digits only, with country code.</p>
            </div>
            <div>
              <label className={label}>Email</label>
              <input name="email" defaultValue={settings?.email ?? ""} className={field} />
            </div>
            <div>
              <label className={label}>Address</label>
              <input name="address" defaultValue={settings?.address ?? ""} className={field} />
            </div>
          </div>
          <div>
            <label className={label}>Response time note</label>
            <input
              name="responseTimeNote"
              defaultValue={settings?.responseTimeNote ?? ""}
              className={field}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <SectionHeading icon={PanelBottom} title="Footer" />
          <div>
            <label className={label}>Footer tagline</label>
            <textarea
              name="footerTagline"
              defaultValue={settings?.footerTagline ?? ""}
              rows={3}
              className={field}
            />
          </div>
          <div>
            <label className={label}>Copyright name</label>
            <input
              name="copyrightName"
              defaultValue={settings?.copyrightName ?? ""}
              className={field}
            />
            <p className="mt-1 text-xs text-slate-400">
              Shown in the footer as &ldquo;© {new Date().getFullYear()} [this name]. All rights
              reserved.&rdquo;
            </p>
          </div>
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-600">Saved.</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent/20 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 h-fit">
        <SectionHeading icon={Share2} title="Social links" />
        <div>
          <label className={label}>WhatsApp</label>
          <input name="social_whatsapp" defaultValue={social.whatsapp ?? ""} className={field} />
        </div>
        <div>
          <label className={label}>Instagram</label>
          <input
            name="social_instagram"
            defaultValue={social.instagram ?? ""}
            className={field}
          />
        </div>
        <div>
          <label className={label}>LinkedIn</label>
          <input name="social_linkedin" defaultValue={social.linkedin ?? ""} className={field} />
        </div>
        <div>
          <label className={label}>TikTok</label>
          <input name="social_tiktok" defaultValue={social.tiktok ?? ""} className={field} />
        </div>
      </div>
    </form>
  );
}
