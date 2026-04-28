"use client";

import { use, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

interface DailyUpdateNewPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function NewDailyUpdatePage({ params }: DailyUpdateNewPageProps) {
  const { projectId } = use(params);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [engineer, setEngineer] = useState("");
  const [status, setStatus] = useState("On schedule");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-8 py-6">
      <PageHeader
        title={`New daily update for ${projectId.replace(/-/g, " ")}`}
        description="Capture field observations, status, attachments and action items for the project."
      >
        <Link
          href={`/projects/nhai/${projectId}/daily-updates`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to updates
        </Link>
      </PageHeader>

      {saved && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
          Update saved successfully. The project timeline has been updated.
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <form className="grid gap-6">
          <label className="space-y-2 text-sm text-slate-700">
            Update title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              type="text"
              placeholder="Enter summary title"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Observation details
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
              placeholder="Describe the work done today"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </label>

          <div className="grid gap-4 lg:grid-cols-3">
            <label className="space-y-2 text-sm text-slate-700">
              Field engineer
              <input
                value={engineer}
                onChange={(event) => setEngineer(event.target.value)}
                type="text"
                placeholder="Engineer name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              >
                <option>On schedule</option>
                <option>At risk</option>
                <option>Delayed</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Attachments
              <input
                type="file"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            Action items
            <textarea
              rows={3}
              placeholder="Enter next actions or follow-up tasks"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Save update
            </button>
            <p className="text-sm text-slate-500">Saving here will update the project timeline and notification feed.</p>
          </div>
        </form>
      </section>
    </div>
  );
}
