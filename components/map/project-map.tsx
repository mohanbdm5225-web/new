"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { Project } from "@/lib/types";
import { formatCompactINR } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  Planning: "#94a3b8",
  Active: "#6366f1",
  "On Hold": "#f59e0b",
  Completed: "#10b981",
  Cancelled: "#f43f5e",
};

export function ProjectMap({
  projects,
  onSelectProject,
}: {
  projects: Project[];
  onSelectProject?: (p: Project) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Initialize map (only once)
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [78.6569, 11.0596], // Tamil Nadu center
      zoom: 6,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.current.addControl(new maplibregl.FullscreenControl(), "top-right");
    map.current.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.current.on("load", () => setLoaded(true));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers whenever projects change
  useEffect(() => {
    if (!map.current || !loaded) return;

    // Clear existing markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    const valid = projects.filter(
      (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
    );

    if (valid.length === 0) return;

    valid.forEach((p) => {
      const color = STATUS_COLORS[p.status] || "#6366f1";

      // Custom marker DOM
      const el = document.createElement("div");
      el.className = "cursor-pointer";
      el.innerHTML = `
        <div style="position: relative; transform: translate(-50%, -100%);">
          <div style="
            width: 30px;
            height: 30px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: 11px;
              font-weight: 700;
            ">${p.progress}</div>
          </div>
        </div>
      `;

      const popupHTML = `
        <div style="font-family: var(--font-inter), sans-serif; min-width: 220px; padding: 4px;">
          <div style="
            display: inline-block;
            background: ${color}20;
            color: ${color};
            font-size: 10px;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 999px;
            margin-bottom: 6px;
          ">${p.status}</div>
          <p style="font-size: 10px; color: #64748b; margin: 0 0 2px;">${p.code}</p>
          <h3 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 4px; line-height: 1.3;">${p.name}</h3>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px;">${p.client} · ${p.type}</p>
          <div style="display: flex; justify-content: space-between; gap: 8px; font-size: 11px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <div>
              <div style="color: #94a3b8; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Budget</div>
              <div style="color: #0f172a; font-weight: 600;">${formatCompactINR(p.budget)}</div>
            </div>
            <div>
              <div style="color: #94a3b8; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Progress</div>
              <div style="color: #0f172a; font-weight: 600;">${p.progress}%</div>
            </div>
          </div>
          <button data-project-id="${p.id}" class="js-open-project" style="
            margin-top: 10px;
            width: 100%;
            background: #4f46e5;
            color: white;
            border: none;
            padding: 7px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          ">View Details →</button>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 30,
        closeButton: true,
        maxWidth: "260px",
      }).setHTML(popupHTML);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.longitude!, p.latitude!])
        .setPopup(popup)
        .addTo(map.current!);

      // Hook up "View Details" button after popup opens
      popup.on("open", () => {
        const btn = document.querySelector(`button.js-open-project[data-project-id="${p.id}"]`) as HTMLButtonElement | null;
        if (btn) {
          btn.onclick = () => {
            popup.remove();
            onSelectProject?.(p);
          };
        }
      });

      markers.current.push(marker);
    });

    // Fit map to show all markers
    if (valid.length === 1) {
      map.current.flyTo({
        center: [valid[0].longitude!, valid[0].latitude!],
        zoom: 10,
      });
    } else if (valid.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      valid.forEach((p) => bounds.extend([p.longitude!, p.latitude!]));
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 10, duration: 800 });
    }
  }, [projects, loaded, onSelectProject]);

  return (
    <div className="relative h-[calc(100vh-260px)] min-h-[500px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Legend */}
      <div className="absolute left-4 top-4 z-10 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-[0_4px_12px_rgba(15,23,42,0.08)] backdrop-blur dark:bg-slate-900/95 dark:border-slate-800">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</p>
        <div className="space-y-1">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <div
                className="h-3 w-3 rounded-full border border-white shadow-sm"
                style={{ background: color }}
              />
              <span className="text-slate-700 dark:text-slate-300">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {projects.filter((p) => p.latitude && p.longitude).length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 dark:bg-slate-900/90">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No projects with coordinates</p>
            <p className="mt-1 text-xs text-slate-500">
              Edit a project and add latitude/longitude to see it here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}