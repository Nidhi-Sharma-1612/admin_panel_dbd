"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastVariant = "success" | "error";
type Toast = { id: number; message: string; variant: ToastVariant };

const ToastContext = createContext<((message: string, variant?: ToastVariant) => void) | null>(
  null,
);

const AUTO_DISMISS_MS = 3500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const isSuccess = toast.variant === "success";

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-2xl shadow-black/20 animate-toast-in"
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full ${
          isSuccess ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
        }`}
      >
        {isSuccess ? <CheckCircle2 className="size-4.5" /> : <AlertCircle className="size-4.5" />}
      </span>
      <p className="flex-1 pt-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast must be used within a ToastProvider");
  return showToast;
}

// Fires `message` via toast exactly once per completed form submission — the
// transition from pending=true to pending=false, not on initial mount or any
// other re-render. Put this in a form component right after its
// useActionState call.
export function useSubmitToast(pending: boolean, error: string | null | undefined, message: string) {
  const showToast = useToast();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      showToast(error ? error : message, error ? "error" : "success");
    }
    wasPending.current = pending;
  }, [pending, error, message, showToast]);
}
