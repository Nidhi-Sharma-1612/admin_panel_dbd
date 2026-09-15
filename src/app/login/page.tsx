"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, Mail, LayoutGrid, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

const FEATURES = [
  { icon: LayoutGrid, text: "Manage every client site's content from one place" },
  { icon: Sparkles, text: "No-code editing for pages, FAQs, and settings" },
  { icon: ShieldCheck, text: "Role-based access, scoped per site" },
];

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--sidebar-bg) px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-accent-light/10 blur-3xl"
      />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/40 lg:grid-cols-2">
        {/* Desktop brand panel */}
        <div className="relative hidden flex-col overflow-hidden bg-(--sidebar-bg) p-10 lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-accent/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 size-72 rounded-full bg-accent-light/15 blur-3xl"
          />

          <Logo className="relative mb-16 w-24 h-auto" />

          <div className="relative flex flex-1 flex-col justify-center space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Sign in to manage content, pages, and settings across every client site you run.
              </p>
            </div>
            <ul className="space-y-3.5">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-accent-light">
                    <Icon className="size-4" />
                  </span>
                  <span className="pt-1.5 text-sm text-white/70">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative mt-16 text-xs text-white/30">
            Design by Dial &middot; Admin Panel
          </p>
        </div>

        {/* Mobile brand header */}
        <div className="flex flex-col items-center gap-3 bg-(--sidebar-bg) px-8 py-8 lg:hidden">
          <Logo className="w-28 h-auto" />
          <div className="text-center">
            <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
            <p className="mt-0.5 text-xs text-white/50">
              Manage content across all client sites.
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center px-8 py-10 sm:px-12 lg:px-12">
          <div className="mb-6 hidden lg:block">
            <h2 className="text-xl font-bold text-slate-900">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your admin credentials to continue.</p>
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  autoFocus
                  placeholder="you@designbydial.com"
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-light"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-10 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-light"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {state.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full accent-gradient py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent/30 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
