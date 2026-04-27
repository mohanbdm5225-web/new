"use client";

import { Eye, EyeOff, Layers, Trash2 } from "lucide-react";
import { useGIS } from "@/lib/gis/use-gis-store";

export function LayerPanel() {
  const {
    layers,
    toggleLayer,
    removeLayer,
    selectedLayerId,
    setSelectedLayerId,
  } = useGIS();

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="mb-3 flex items-center gap-2">
        <Layers className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-900">Layers</h3>
      </div>

      <div className="space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => setSelectedLayerId(layer.id)}
            className={`cursor-pointer rounded-lg border p-2 ${
              selectedLayerId === layer.id
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                  {layer.name}
                </p>
                <p className="text-xs text-slate-500">
                  {layer.visible ? "Visible" : "Hidden"}
                </p>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleLayer(layer.id);
                  }}
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                >
                  {layer.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    removeLayer(layer.id);
                  }}
                  className="rounded-md p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {layers.length === 0 && (
          <p className="text-sm text-slate-500">No layers uploaded yet.</p>
        )}
      </div>
    </div>
  );
}