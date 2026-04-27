"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { projects } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { formatCompactINR } from "@/lib/utils";

const projectCoordinates: Record<string, [number, number]> = {
  p1: [13.0827, 80.2707],
  p2: [11.6643, 78.146],
  p3: [13.2522, 80.321],
  p4: [11.0168, 76.9558],
  p5: [12.5186, 78.2137],
  p6: [12.9941, 80.1709],
  p7: [8.7642, 78.1348],
  p8: [9.9252, 78.1198],
};

const icon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;background:#4f46e5;border:3px solid white;border-radius:999px;box-shadow:0 6px 18px rgba(79,70,229,.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function ProjectMap() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <MapContainer
        center={[11.8, 78.8]}
        zoom={7}
        scrollWheelZoom
        className="h-[620px] w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {projects.map((project) => {
          const position = projectCoordinates[project.id];
          if (!position) return null;

          return (
            <Marker key={project.id} position={position} icon={icon}>
              <Popup>
                <div className="w-72 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {project.code}
                    </p>
                    <h3 className="text-sm font-bold text-slate-900">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500">{project.client}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={project.status} />
                    <StatusBadge status={project.priority} />
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <ProgressBar value={project.progress} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-slate-500">Budget</p>
                      <p className="font-semibold text-slate-900">
                        {formatCompactINR(project.budget)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-slate-500">Location</p>
                      <p className="font-semibold text-slate-900">
                        {project.location}
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}