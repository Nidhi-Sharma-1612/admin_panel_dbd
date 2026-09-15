"use client";

import { useActionState, useMemo, useState } from "react";
import { Eye, EyeOff, UserPlus, Check, X } from "lucide-react";
import type { UserFormState } from "./actions";

type SiteOption = { id: string; name: string };

type ExistingUser = { name: string; email: string; siteIds: string[] };

const field =
  "w-full rounded-lg border border-slate-200 py-2.5 px-3 pr-10 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-light";
const plainField =
  "w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-light";
const label = "block text-sm font-medium text-slate-700 mb-1";

function PasswordInput({
  name,
  labelText,
  required,
  value,
  onChange,
}: {
  name: string;
  labelText: string;
  required: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className={label}>{labelText}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={field}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export function UserForm({
  user,
  availableSites,
  action,
  submitLabel,
}: {
  user?: ExistingUser;
  availableSites: SiteOption[];
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedSites, setSelectedSites] = useState<Set<string>>(
    new Set(user?.siteIds ?? availableSites.map((s) => s.id)),
  );

  const isEdit = !!user;
  const settingPassword = !isEdit || password.length > 0;
  const longEnough = !settingPassword || password.length >= 8;
  const passwordsMatch = !settingPassword || (confirmPassword.length > 0 && password === confirmPassword);
  const hasSiteAccess = selectedSites.size > 0;
  const canSubmit =
    name.trim().length > 0 && email.trim().length > 0 && longEnough && passwordsMatch && hasSiteAccess;

  const checklist = useMemo(
    () => [
      { label: "At least 8 characters", met: longEnough },
      { label: "Passwords match", met: passwordsMatch },
    ],
    [longEnough, passwordsMatch],
  );

  function toggleSite(id: string) {
    setSelectedSites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelected = selectedSites.size === availableSites.length;

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-dark">
            <UserPlus className="size-4.5" />
          </div>
          <p className="text-sm text-slate-500">
            {isEdit
              ? "Update this person's login details and which sites they can manage."
              : "Create a login for someone else to help manage your sites."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Name</label>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={plainField}
            />
          </div>
          <div>
            <label className={label}>Email</label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={plainField}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PasswordInput
            name="password"
            labelText={isEdit ? "New password (optional)" : "Password"}
            required={!isEdit}
            value={password}
            onChange={setPassword}
          />
          <PasswordInput
            name="confirmPassword"
            labelText="Confirm password"
            required={!isEdit}
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </div>
        {isEdit && (
          <p className="text-xs text-slate-400 -mt-2">Leave both blank to keep their current password.</p>
        )}

        {settingPassword && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {checklist.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-1.5 text-xs ${
                  item.met ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {item.met ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                {item.label}
              </li>
            ))}
          </ul>
        )}

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className={label}>Site access</label>
            <button
              type="button"
              onClick={() =>
                setSelectedSites(
                  allSelected ? new Set() : new Set(availableSites.map((s) => s.id)),
                )
              }
              className="text-xs font-medium text-accent-dark hover:underline"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
          <div className="space-y-1 rounded-lg border border-slate-200 p-2">
            {availableSites.map((site) => (
              <label
                key={site.id}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  name="siteIds"
                  value={site.id}
                  checked={selectedSites.has(site.id)}
                  onChange={() => toggleSite(site.id)}
                  className="size-4 rounded border-slate-300 text-accent focus:ring-accent-light"
                />
                {site.name}
              </label>
            ))}
          </div>
          {!hasSiteAccess && (
            <p className="mt-1 text-xs text-red-600">Select at least one site.</p>
          )}
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending || !canSubmit}
          className="rounded-full accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent/20 disabled:opacity-40"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 h-fit space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preview</p>
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full accent-gradient text-sm font-semibold text-white">
            {(name.trim().charAt(0) || "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {name.trim() || "New user"}
            </p>
            <p className="truncate text-xs text-slate-500">{email.trim() || "their@email.com"}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">
            Access to {selectedSites.size} of {availableSites.length} site
            {availableSites.length === 1 ? "" : "s"}
          </p>
          {selectedSites.size === 0 ? (
            <p className="text-xs text-slate-400">No sites selected yet.</p>
          ) : (
            <ul className="space-y-1">
              {availableSites
                .filter((s) => selectedSites.has(s.id))
                .map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                    {s.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </form>
  );
}
