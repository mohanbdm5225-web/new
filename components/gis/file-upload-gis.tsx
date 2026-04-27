"use client";

import { Upload } from "lucide-react";
import { useGIS } from "@/lib/gis/use-gis-store";
import { parseGeoJSON } from "@/lib/gis/parsers/geojson-parser";
import { parseKML } from "@/lib/gis/parsers/kml-parser";

export function FileUploadGIS() {
  const { addLayer } = useGIS();

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    let data = null;

    // ✅ GEOJSON
    if (extension === "geojson" || extension === "json") {
      const text = await file.text();
      data = parseGeoJSON(text);
    }

    // ✅ KML (IMPORTANT)
    if (extension === "kml") {
      const text = await file.text();
      data = parseKML(text);
    }

    if (!data) {
      alert("Unsupported file. Upload .geojson or .kml");
      return;
    }

    addLayer({
      id: crypto.randomUUID(),
      name: file.name,
      data,
      color: getRandomColor(),
    });

    event.target.value = "";
  }

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center gap-2 mb-2">
        <Upload className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold">Upload GIS File</h3>
      </div>

      <input
        type="file"
        accept=".geojson,.json,.kml"
        onChange={handleFile}
        className="w-full text-sm"
      />

      <p className="text-xs text-slate-500 mt-2">
        Supported: GeoJSON, KML
      </p>
    </div>
  );
}

function getRandomColor() {
  const colors = [
    "#2563eb",
    "#16a34a",
    "#dc2626",
    "#9333ea",
    "#f97316",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}