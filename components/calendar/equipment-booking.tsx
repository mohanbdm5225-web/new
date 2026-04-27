"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Drone,
  MapPin,
  Save,
  User,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { equipment, projects, team } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";

const bookings = [
  {
    id: "b1",
    equipment: "DJI Matrice 350 RTK",
    project: "Krishnagiri Solar Farm Drone Survey",
    user: "Vikram Sethu",
    date: "2026-04-25",
    status: "Booked",
  },
  {
    id: "b2",
    equipment: "Trimble R12i DGPS",
    project: "Chennai Metro Phase-III Corridor Survey",
    user: "Arvind Kumar",
    date: "2026-04-26",
    status: "Booked",
  },
  {
    id: "b3",
    equipment: "R2Sonic 2024 Multibeam",
    project: "Ennore Port Bathymetry Survey",
    user: "Rohit Pillai",
    date: "2026-04-28",
    status: "Planned",
  },
];

export function EquipmentBooking() {
  const [equipmentId, setEquipmentId] = useState(equipment[0]?.id ?? "");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [userId, setUserId] = useState(team[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Wrench className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Equipment Booking
            </h2>
            <p className="text-sm text-slate-500">
              Reserve drone, DGPS, LiDAR or bathymetry equipment.
            </p>
          </div>
        </div>

        {saved && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Booking saved locally for UI preview.
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Field label="Equipment">
            <Select
              value={equipmentId}
              onChange={setEquipmentId}
              options={equipment.map((item) => ({
                label: `${item.name} — ${item.status}`,
                value: item.id,
              }))}
            />
          </Field>

          <Field label="Project">
            <Select
              value={projectId}
              onChange={setProjectId}
              options={projects.map((project) => ({
                label: `${project.code} — ${project.name}`,
                value: project.id,
              }))}
            />
          </Field>

          <Field label="Assigned User">
            <Select
              value={userId}
              onChange={setUserId}
              options={team.map((member) => ({
                label: `${member.name} — ${member.role}`,
                value: member.id,
              }))}
            />
          </Field>

          <Field label="Booking Date">
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </Field>

          <Field label="Purpose">
            <textarea
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="Example: Drone survey, DGPS control observation, LiDAR acquisition..."
              className="min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </Field>

          <Button type="submit" className="w-full">
            <Save className="h-4 w-4" />
            Save Booking
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Upcoming Bookings
          </h2>
          <p className="text-sm text-slate-500">
            Equipment already planned for field work.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {bookings.map((booking) => (
            <div key={booking.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Drone className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                      {booking.equipment}
                    </p>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {booking.project}
                    </p>
                    <p className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {booking.user}
                    </p>
                    <p className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {booking.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}