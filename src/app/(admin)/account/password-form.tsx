"use client";

import { useActionState, useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound, Check, X } from "lucide-react";
import { updatePasswordAction, type PasswordState } from "./actions";

const initialState: PasswordState = {};
const field =
  "w-full rounded-lg border border-slate-200 py-2.5 px-3 pr-10 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-light";
const label = "block text-sm font-medium text-slate-700 mb-1";

function PasswordInput({
  name,
  label: fieldLabel,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className={label}>{fieldLabel}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          name={name}
          required
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

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const longEnough = newPassword.length >= 8;
  const match = confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = currentPassword.length > 0 && longEnough && match;

  const checklist = useMemo(
    () => [
      { label: "At least 8 characters", met: longEnough },
      { label: "Matches confirmation", met: match },
    ],
    [longEnough, match],
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-dark">
          <KeyRound className="size-4.5" />
        </div>
        <p className="text-sm text-slate-500">Update the password you use to sign in here.</p>
      </div>

      <PasswordInput
        name="currentPassword"
        label="Current password"
        value={currentPassword}
        onChange={setCurrentPassword}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PasswordInput
          name="newPassword"
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
        />
        <PasswordInput
          name="confirmPassword"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </div>

      {newPassword.length > 0 && (
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

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Password updated.</p>}

      <button
        type="submit"
        disabled={pending || !canSubmit}
        className="rounded-full accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent/20 disabled:opacity-40"
      >
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
