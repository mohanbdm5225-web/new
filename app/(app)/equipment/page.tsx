"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Download,
  Plus,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { equipment, team } from "@/lib/mock-data";
import { daysUntil, formatDate, formatINR } from "@/lib/utils";

export default function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");

  const statuses = [
    "All",
    ...Array.from(new Set(equipment.map((item) => item.status))),
  ];

  const categories = [
    "All",
    ...Array.from(new Set(equipment.map((item) => item.category))),
  ];

  const availableCount = equipment.filter(
    (item) => item.status === "Available"
  ).length;

  const inUseCount = equipment.filter((item) => item.status === "In Use").length;

  const maintenanceCount = equipment.filter(
    (item) => item.status === "Maintenance"
  ).length;

  const upcomingMaintenanceCount = equipment.filter(
    (item) => daysUntil(item.nextMaintenance) <= 30
  ).length;

  const totalAssetValue = equipment.reduce((sum, item) => sum + item.value, 0);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const assignedPerson = item.assignedTo
        ? team.find((member) => member.id === item.assignedTo)
        : null;

      const matchesSearch = `${item.name} ${item.serialNumber} ${item.category} ${item.status} ${item.location} ${
        assignedPerson?.name ?? ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = status === "All" || item.status === status;
      const matchesCategory = category === "All" || item.category === category;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [search, status, category]);

  function getAssignedPerson(userId: string | null) {
    if (!userId) return "Not Assigned";
    return team.find((member) => member.id === userId)?.name ?? "Not Assigned";
  }

  return (
    <div>
      <PageHeader
        title="Equipment"
        description="Track drones, DGPS, LiDAR scanners, echo sounders, total stations and workstations."
      >
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Export
        </Button>

        <Button>
          <Plus className="h-4 w-4" />
          Add Equipment
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Available"
          value={availableCount}
          icon={ShieldCheck}
          tone="emerald"
          hint="Ready for assignment"
          index={0}
        />

        <StatCard
          label="In Use"
          value={inUseCount}
          icon={Wrench}
          tone="indigo"
          hint="Currently assigned"
          index={1}
        />

        <StatCard
          label="Maintenance"
          value={maintenanceCount}
          icon={AlertTriangle}
          tone="rose"
          hint="Needs attention"
          index={2}
        />

        <StatCard
          label="Due in 30 Days"
          value={upcomingMaintenanceCount}
          icon={CalendarDays}
          tone="amber"
          hint="Upcoming service"
          index={3}
        />
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Asset Summary
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Total equipment asset value under tracking.
            </p>
          </div>

          <div className="text-left lg:text-right">
            <p className="font-num text-3xl font-bold text-slate-900">
              {formatINR(totalAssetValue)}
            </p>
            <p className="text-sm text-slate-500">Total asset value</p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:w-96">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search equipment, serial no, location..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statuses.map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  status === item
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                category === item
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div className="col-span-3">Equipment</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-1">Assigned</div>
          <div className="col-span-1">Value</div>
          <div className="col-span-1">Next Service</div>
          <div className="col-span-1 text-right">Due</div>
        </div>

        {filteredEquipment.map((item) => {
          const serviceDueDays = daysUntil(item.nextMaintenance);

          return (
            <div
              key={item.id}
              className="grid grid-cols-12 items-center border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="col-span-3">
                <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  S/N: {item.serialNumber}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-sm text-slate-600">{item.category}</p>
              </div>

              <div className="col-span-1">
                <StatusBadge status={item.status} />
              </div>

              <div className="col-span-2">
                <p className="line-clamp-1 text-sm text-slate-600">
                  {item.location}
                </p>
              </div>

              <div className="col-span-1">
                <p className="line-clamp-1 text-xs text-slate-600">
                  {getAssignedPerson(item.assignedTo)}
                </p>
              </div>

              <div className="col-span-1">
                <p className="font-num text-xs font-semibold text-slate-900">
                  {formatINR(item.value)}
                </p>
              </div>

              <div className="col-span-1">
                <p className="text-xs text-slate-500">
                  {formatDate(item.nextMaintenance)}
                </p>
              </div>

              <div className="col-span-1 text-right">
                <p
                  className={`text-xs font-semibold ${
                    serviceDueDays < 0
                      ? "text-rose-600"
                      : serviceDueDays <= 30
                      ? "text-amber-600"
                      : "text-slate-500"
                  }`}
                >
                  {serviceDueDays < 0
                    ? `${Math.abs(serviceDueDays)}d late`
                    : `${serviceDueDays}d left`}
                </p>
              </div>
            </div>
          );
        })}

        {filteredEquipment.length === 0 && (
          <div className="p-10 text-center">
            <Wrench className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              No equipment found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search, status or category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}