"use client";

import dynamic from "next/dynamic";

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

export default function NhaiPage() {
  return <NhaiProjectManagementDashboard />;
}
