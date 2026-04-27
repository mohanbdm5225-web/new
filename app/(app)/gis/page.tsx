"use client";

import dynamic from "next/dynamic";

const GisWorkspace = dynamic(
  () => import("@/components/gis/gis-workspace").then((m) => m.GisWorkspace),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-110px)] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading GIS Workspace...
          </p>
        </div>
      </div>
    ),
  }
);

export default function GisPage() {
  return (
    <div className="h-[calc(100vh-110px)]">
      <GisWorkspace />
    </div>
  );
}