"use client";

import { use, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

interface ProjectSettingsPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { projectId } = use(params);
  const [frequency, setFrequency] = useState("Weekly");
  const [recipient, setRecipient] = useState("project.team@nhai.gov.in");
  const [notifications, setNotifications] = useState({
    dailyUpdates: true,
    chainageAlerts: true,
    deliverablesDue: false,
  });
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-8 py-6">
      <PageHeader
        title={`Settings for ${projectId.replace(/-/g, " ")}`}
        description="Configure reporting, alerts and project preferences for this NHAI work order."
      >
        <Link
          href={`/projects/nhai/${projectId}`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to overview
        </Link>
      </PageHeader>

      {saved && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
          Settings saved successfully.
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Reporting frequency
            <select
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option>Weekly</option>
              <option>Biweekly</option>
              <option>Monthly</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Notification recipient
            <input
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              type="email"
              placeholder="project.team@nhai.gov.in"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </label>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-6">
          <p className="text-sm font-semibold text-slate-900">Alert preferences</p>
          <div className="mt-4 space-y-4">
            {[
              { key: "dailyUpdates", label: "Daily update reminders" },
              { key: "chainageAlerts", label: "Chainage risk alerts" },
              { key: "deliverablesDue", label: "Deliverable due date alerts" },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-4 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof notifications],
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Save settings
          </button>
          <p className="text-sm text-slate-500">
            These preferences control alerts and reports for the project. Changes will apply immediately.
          </p>
        </div>
      </section>
    </div>
  );
}
