"use client";

import { useActionState, useState } from "react";
import { ChevronDown, HelpCircle, Settings2 } from "lucide-react";
import type { FaqState } from "./actions";

type Faq = { question: string; answer: string; order?: number | null } | undefined;

const field =
  "w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-light";
const label = "block text-sm font-medium text-slate-700 mb-1";

export function FaqForm({
  faq,
  action,
  submitLabel,
}: {
  faq?: Faq;
  action: (state: FaqState, formData: FormData) => Promise<FaqState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [advanced, setAdvanced] = useState(false);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-dark">
            <HelpCircle className="size-4.5" />
          </div>
          <p className="text-sm text-slate-500">
            One question and its answer, shown in the FAQ list on your site.
          </p>
        </div>

        <div>
          <label className={label}>Question</label>
          <input
            name="question"
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What is the cancellation policy?"
            className={field}
          />
        </div>
        <div>
          <label className={label}>Answer</label>
          <textarea
            name="answer"
            required
            rows={6}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write the answer your guests will see..."
            className={field}
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <div className="flex items-center justify-between pt-1">
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
          <div className="w-40 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <label className={label}>Display order</label>
            <input name="order" type="number" defaultValue={faq?.order ?? 0} className={field} />
            <p className="mt-1 text-xs text-slate-400">Lower numbers show first.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 h-fit">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Preview
        </p>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-900">
            {question.trim() || "Your question will appear here"}
          </p>
          <p className="mt-2 text-sm text-slate-500 whitespace-pre-wrap">
            {answer.trim() || "Your answer will appear here."}
          </p>
        </div>
      </div>
    </form>
  );
}
