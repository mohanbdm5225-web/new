"use client";

import { Download, Trash2 } from "lucide-react";
import { useGIS } from "@/lib/gis/use-gis-store";

export function ExportMap() {
  const { layers, clearAllLayers } = useGIS();

  function handleExportGeoJson() {
    const collection = {
      type: "FeatureCollection",
      features: layers.flatMap((layer) => {
        const data: any = layer.data;

        if (data.type === "FeatureCollection") return data.features;
        if (data.type === "Feature") return [data];

        return [];
      }),
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "gis-export.geojson";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleExportGeoJson}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        <Download className="h-4 w-4" />
        Export GeoJSON
      </button>

      <button
        onClick={clearAllLayers}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
      >
        <Trash2 className="h-4 w-4" />
        Clear Layers
      </button>
    </div>
  );
}