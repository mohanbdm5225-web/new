"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileSignature,
  MapPin,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { cn, formatDate } from "@/lib/utils";
import { DsrEntry, getDsrEntries } from "@/lib/dsr-store";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "Field Work" | "Tender" | "DSR" | "Equipment" | "Review";
  location: string;
  progress?: number;
  reportedBy?: string;
  workDone?: string;
  issues?: string;
  nextPlan?: string;
};

const staticEvents: CalendarEvent[] = [
  {
    id: "e1",
    title: "CMRL DGPS Field Survey",
    date: "2026-04-25",
    type: "Field Work",
    location: "Chennai",
  },
  {
    id: "e2",
    title: "NH-544 LiDAR Flight",
    date: "2026-04-26",
    type: "Field Work",
    location: "Salem–Kochi",
  },
  {
    id: "e3",
    title: "Tender Submission — AAI GIS",
    date: "2026-05-20",
    type: "Tender",
    location: "Online Portal",
  },
  {
    id: "e4",
    title: "Equipment Service — DGPS",
    date: "2026-05-05",
    type: "Equipment",
    location: "Chennai HQ",
  },
  {
    id: "e5",
    title: "Bathymetry Report Review",
    date: "2026-04-28",
    type: "Review",
    location: "Ennore",
  },
];

export function MonthCalendar() {
  const today = new Date();

  const [dsrEntries, setDsrEntries] = useState<DsrEntry[]>([]);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));

  function loadDsrEntries() {
    setDsrEntries(getDsrEntries());
  }

  useEffect(() => {
    loadDsrEntries();

    window.addEventListener("dsr-updated", loadDsrEntries);

    return () => {
      window.removeEventListener("dsr-updated", loadDsrEntries);
    };
  }, []);

  const dsrEvents: CalendarEvent[] = dsrEntries.map((entry) => ({
    id: entry.id,
    title: `DSR — ${entry.projectName}`,
    date: entry.date,
    type: "DSR",
    location: entry.location,
    progress: entry.progress,
    reportedBy: entry.reportedByName,
    workDone: entry.workDone,
    issues: entry.issues,
    nextPlan: entry.nextPlan,
  }));

  const events = [...staticEvents, ...dsrEvents];

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const startDate = new Date(year, month, 1 - startDay);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return date;
    });
  }, [currentMonth]);

  const selectedEvents = events.filter((event) => event.date === selectedDate);
  const selectedDsr = selectedEvents.filter((event) => event.type === "DSR");

  function goPreviousMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  }

  function goNextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  }

  function goToday() {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(toDateKey(now));
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Calendar + DSR
            </h2>
            <p className="text-sm text-slate-500">
              Saved DSR entries now appear automatically on their report date.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>

          <Button variant="outline" size="sm" onClick={goNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-b border-slate-200 p-5">
        <h3 className="text-xl font-bold text-slate-900">
          {currentMonth.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </h3>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-3">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((date) => {
          const dateKey = toDateKey(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isToday = dateKey === toDateKey(new Date());
          const isSelected = selectedDate === dateKey;
          const dayEvents = events.filter((event) => event.date === dateKey);
          const hasDsr = dayEvents.some((event) => event.type === "DSR");

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(dateKey)}
              className={cn(
                "min-h-28 border-b border-r border-slate-100 p-2 text-left transition hover:bg-indigo-50/50",
                !isCurrentMonth && "bg-slate-50/70 text-slate-300",
                isSelected && "bg-indigo-50"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                    isToday
                      ? "bg-indigo-600 text-white"
                      : isSelected
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-700"
                  )}
                >
                  {date.getDate()}
                </div>

                {hasDsr && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    DSR
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "line-clamp-1 rounded-md px-2 py-1 text-[11px] font-semibold",
                      event.type === "Tender"
                        ? "bg-amber-50 text-amber-700"
                        : event.type === "Field Work"
                        ? "bg-indigo-50 text-indigo-700"
                        : event.type === "DSR"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {event.title}
                  </div>
                ))}

                {dayEvents.length > 2 && (
                  <p className="text-[11px] font-semibold text-slate-400">
                    +{dayEvents.length - 2} more
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 border-t border-slate-200 p-5 xl:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Selected Date: {formatDate(selectedDate)}
          </h3>

          <div className="mt-4 space-y-3">
            {selectedEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-soft">
                  {getEventIcon(event.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {event.title}
                    </p>
                    <StatusBadge status={event.type} />
                  </div>

                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location}
                  </p>
                </div>
              </div>
            ))}

            {selectedEvents.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                <p className="text-sm font-semibold text-slate-900">
                  No schedule found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  No planned work or DSR for this date.
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">DSR Summary</h3>

          <div className="mt-4 space-y-3">
            {selectedDsr.map((dsr) => (
              <div
                key={dsr.id}
                className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {dsr.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Reported by {dsr.reportedBy}
                    </p>
                  </div>

                  <StatusBadge status="DSR" />
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-num font-bold text-slate-900">
                      {dsr.progress ?? 0}%
                    </span>
                  </div>
                  <ProgressBar value={dsr.progress ?? 0} />
                </div>

                <div className="mt-4 grid gap-3">
                  <InfoBox title="Work Done" value={dsr.workDone ?? "—"} />
                  <InfoBox title="Issues" value={dsr.issues ?? "—"} />
                  <InfoBox title="Next Plan" value={dsr.nextPlan ?? "—"} />
                </div>
              </div>
            ))}

            {selectedDsr.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  No DSR for this date
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Create DSR from the DSR page.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getEventIcon(type: CalendarEvent["type"]) {
  if (type === "Tender") return <FileSignature className="h-4 w-4" />;
  if (type === "Field Work") return <Plane className="h-4 w-4" />;
  if (type === "DSR") return <ClipboardList className="h-4 w-4" />;

  return <CalendarDays className="h-4 w-4" />;
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">
        {value}
      </p>
    </div>
  );
}