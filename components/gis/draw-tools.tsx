"use client";

import { CircleDot, MousePointer2, Pentagon, Route } from "lucide-react";
import { useGIS } from "@/lib/gis/use-gis-store";
import { GisTool } from "@/lib/gis/types";

const tools: { id: GisTool; label: string; icon: React.ElementType }[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "point", label: "Point", icon: CircleDot },
  { id: "line", label: "Line", icon: Route },
  { id: "polygon", label: "Polygon", icon: Pentagon },
];

export function DrawTools() {
  const { activeTool, setActiveTool } = useGIS();

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Draw Tools</h3>

      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const active = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                active
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tool.label}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Point: one click. Line: two clicks. Polygon: three clicks.
      </p>
    </div>
  );
}