"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const NhaiProjectManagementDashboard = dynamic(
  () =>
    import("@/components/nhai/project-management-dashboard").then(
      (module) => module.NhaiProjectManagementDashboard
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-600 shadow-soft">
        Loading NHAI project management...
      </div>
    ),
  }
);

export default function NhaiGisPage() {
  return (
    <div className="space-y-6 py-6">
      <Link
        href="/gis"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to GIS
      </Link>
      <NhaiProjectManagementDashboard />
    </div>
  );
}