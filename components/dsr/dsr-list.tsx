"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  MapPin,
  Trash2,
  User,
} from "lucide-react";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  deleteDsrEntry,
  DsrEntry,
  getDsrEntries,
} from "@/lib/dsr-store";

export function DsrList() {
  const [items, setItems] = useState<DsrEntry[]>([]);

  function loadItems() {
    setItems(getDsrEntries());
  }

  useEffect(() => {
    loadItems();
    window.addEventListener("dsr-updated", loadItems);

    return () => {
      window.removeEventListener("dsr-updated", loadItems);
    };
  }, []);

  function handleDelete(id: string) {
    deleteDsrEntry(id);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ClipboardList className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Saved DSR Entries
            </h2>
            <p className="text-sm text-slate-500">
              These entries are saved in browser local storage.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="p-5 transition hover:bg-slate-50">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="line-clamp-1 text-sm font-bold text-slate-900">
                    {item.projectName}
                  </h3>
                  <StatusBadge status={item.workType} />
                </div>

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {item.date}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {item.reportedByName}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <InfoBox title="Work Done" value={item.workDone} />
                  <InfoBox title="Issues" value={item.issues} />
                  <InfoBox title="Next Plan" value={item.nextPlan} />
                </div>
              </div>

              <div className="w-full shrink-0 lg:w-48">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-num font-bold text-slate-900">
                    {item.progress}%
                  </span>
                </div>

                <ProgressBar value={item.progress} />

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="p-10 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              No DSR entries found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Create your first daily status report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">
        {value}
      </p>
    </div>
  );
}