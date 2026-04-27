"use client";

import { Palette } from "lucide-react";
import { useGIS } from "@/lib/gis/use-gis-store";

export function StyleEditor() {
  const { layers, selectedLayerId, updateLayerColor } = useGIS();

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Palette className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-900">Style Editor</h3>
      </div>

      {!selectedLayer && (
        <p className="text-sm text-slate-500">
          Select a layer to change color.
        </p>
      )}

      {selectedLayer && (
        <div>
          <p className="mb-2 line-clamp-1 text-sm font-medium text-slate-700">
            {selectedLayer.name}
          </p>

          <input
            type="color"
            value={selectedLayer.color}
            onChange={(event) =>
              updateLayerColor(selectedLayer.id, event.target.value)
            }
            className="h-10 w-full cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}