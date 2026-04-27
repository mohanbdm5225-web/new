"use client";

import { Ruler } from "lucide-react";
import { useGIS } from "@/lib/gis/use-gis-store";

export function MeasureWidget({ measurement }: { measurement: string }) {
  const { activeTool, setActiveTool } = useGIS();

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Ruler className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-900">Measure</h3>
      </div>

      <button
        onClick={() => setActiveTool("measure")}
        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${
          activeTool === "measure"
            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
            : "border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
      >
        Measure Distance
      </button>

      <p className="mt-2 text-xs text-slate-500">
        Click two points on the map.
      </p>

      {measurement && (
        <div className="mt-3 rounded-lg bg-amber-50 p-2 text-sm font-bold text-amber-700">
          Last Distance: {measurement}
        </div>
      )}
    </div>
  );
}