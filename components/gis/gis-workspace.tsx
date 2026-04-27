"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  ScaleControl,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type {
  LatLngBoundsExpression,
  LatLngExpression,
  LeafletMouseEvent,
} from "leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import {
  Crosshair,
  Layers,
  MapPinned,
  MousePointer2,
  Pentagon,
  Route,
  Ruler,
  Trash2,
  Upload,
  ZoomIn,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";
import { fixLeafletIcons } from "@/lib/gis/leaflet-fix";
import { useGIS } from "@/lib/gis/use-gis-store";
import { GisTool } from "@/lib/gis/types";
import { calculateDistance } from "@/lib/gis/analysis/distance";
import { calculatePolygonAreaSqKm } from "@/lib/gis/analysis/area";

import { FileUploadGIS } from "./file-upload-gis";
import { LayerPanel } from "./layer-panel";
import { StyleEditor } from "./style-editor";
import { ExportMap } from "./export-map";

const tools: { id: GisTool; label: string; icon: React.ElementType }[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "point", label: "Point", icon: Crosshair },
  { id: "line", label: "Line", icon: Route },
  { id: "polygon", label: "Polygon", icon: Pentagon },
  { id: "measure", label: "Measure", icon: Ruler },
];

export function GisWorkspace() {
  const {
    layers,
    addLayer,
    activeTool,
    setActiveTool,
    clearAllLayers,
  } = useGIS();

  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measurement, setMeasurement] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const visibleLayers = useMemo(
    () => layers.filter((layer) => layer.visible),
    [layers]
  );

  function handleMapClick(event: LeafletMouseEvent) {
    const clicked: [number, number] = [event.latlng.lng, event.latlng.lat];

    if (activeTool === "point") {
      addLayer({
        id: crypto.randomUUID(),
        name: "Drawn Point",
        data: createFeatureCollection([
          {
            type: "Feature",
            properties: { name: "Drawn Point" },
            geometry: { type: "Point", coordinates: clicked },
          },
        ]),
        color: "#dc2626",
      });
    }

    if (activeTool === "line") {
      const nextPoints = [...drawPoints, clicked];
      setDrawPoints(nextPoints);

      if (nextPoints.length >= 2) {
        addLayer({
          id: crypto.randomUUID(),
          name: "Drawn Line",
          data: createFeatureCollection([
            {
              type: "Feature",
              properties: { name: "Drawn Line" },
              geometry: { type: "LineString", coordinates: nextPoints },
            },
          ]),
          color: "#16a34a",
        });

        setDrawPoints([]);
      }
    }

    if (activeTool === "polygon") {
      const nextPoints = [...drawPoints, clicked];
      setDrawPoints(nextPoints);

      if (nextPoints.length >= 3) {
        const closedPoints = [...nextPoints, nextPoints[0]];

        addLayer({
          id: crypto.randomUUID(),
          name: "Drawn Polygon",
          data: createFeatureCollection([
            {
              type: "Feature",
              properties: {
                name: "Drawn Polygon",
                areaSqKm: calculatePolygonAreaSqKm(closedPoints),
              },
              geometry: { type: "Polygon", coordinates: [closedPoints] },
            },
          ]),
          color: "#9333ea",
        });

        setDrawPoints([]);
      }
    }

    if (activeTool === "measure") {
      const nextPoints = [...measurePoints, clicked];
      setMeasurePoints(nextPoints);

      if (nextPoints.length === 2) {
        const distanceKm = calculateDistance(
          [nextPoints[0][1], nextPoints[0][0]],
          [nextPoints[1][1], nextPoints[1][0]]
        );

        setMeasurement(`${distanceKm.toFixed(3)} km`);

        addLayer({
          id: crypto.randomUUID(),
          name: `Measurement - ${distanceKm.toFixed(3)} km`,
          data: createFeatureCollection([
            {
              type: "Feature",
              properties: { distanceKm },
              geometry: { type: "LineString", coordinates: nextPoints },
            },
          ]),
          color: "#f97316",
        });

        setMeasurePoints([]);
      }
    }
  }

  return (
    <div className="flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-soft">
      {sidebarOpen && (
        <aside className="w-[360px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  GIS Workspace
                </h2>
                <p className="text-xs text-slate-500">
                  KML, GeoJSON, drawing, measuring and layer control
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <FileUploadGIS />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Layer Manager
                </h3>
              </div>
              <LayerPanel />
            </div>

            <StyleEditor />

            <ExportMap />

            <Button
              variant="outline"
              className="w-full border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={clearAllLayers}
            >
              <Trash2 className="h-4 w-4" />
              Clear All Layers
            </Button>
          </div>
        </aside>
      )}

      <main className="relative flex-1 overflow-hidden">
        <div className="absolute left-4 top-4 z-[1000] flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
          <button
            onClick={() => setSidebarOpen((value) => !value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {sidebarOpen ? "Hide Panel" : "Show Panel"}
          </button>

          {tools.map((tool) => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tool.label}
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-4 left-4 z-[1000] grid gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm shadow-lg backdrop-blur">
            <p className="font-semibold text-slate-900">
              Active Tool:{" "}
              <span className="text-indigo-600">{activeTool}</span>
            </p>
            <p className="text-xs text-slate-500">
              Layers: {layers.length} | Visible: {visibleLayers.length}
            </p>
            {measurement && (
              <p className="mt-1 text-xs font-bold text-amber-600">
                Last distance: {measurement}
              </p>
            )}
          </div>
        </div>

        <MapContainer
          center={[13.0827, 80.2707] as LatLngExpression}
          zoom={10}
          className="h-full w-full"
          preferCanvas
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ScaleControl position="bottomright" />

          <MapClickHandler onMapClick={handleMapClick} />
          <AutoZoomToLayers layers={visibleLayers} />

          {visibleLayers.map((layer) => (
            <GeoJSON
              key={`${layer.id}-${layer.color}-${layer.visible}`}
              data={layer.data}
              style={() => ({
                color: layer.color,
                weight: 3,
                fillColor: layer.color,
                fillOpacity: 0.22,
              })}
              pointToLayer={(_, latlng) =>
                L.circleMarker(latlng, {
                  radius: 7,
                  color: layer.color,
                  fillColor: layer.color,
                  fillOpacity: 0.9,
                })
              }
            />
          ))}
        </MapContainer>

        {layers.length === 0 && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
            <div className="max-w-md rounded-3xl border border-slate-200 bg-white/95 p-6 text-center shadow-xl backdrop-blur">
              <Upload className="mx-auto h-10 w-10 text-indigo-600" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">
                Import your first GIS layer
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Upload KML or GeoJSON from your drone survey, NHAI work order,
                DGPS boundary, or project area file. The map will automatically
                zoom to the layer.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AutoZoomToLayers({
  layers,
}: {
  layers: ReturnType<typeof useGIS>["layers"];
}) {
  const map = useMap();

  useEffect(() => {
    if (layers.length === 0) return;

    const latestLayer = layers[layers.length - 1];
    const bounds = getGeoJsonBounds(latestLayer.data);

    if (!bounds) return;

    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 17,
    });
  }, [layers, map]);

  return null;
}

function getGeoJsonBounds(data: unknown): LatLngBoundsExpression | null {
  const coordinates: [number, number][] = [];

  function collectCoords(value: unknown) {
    if (!Array.isArray(value)) return;

    if (
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      coordinates.push([value[1], value[0]]);
      return;
    }

    value.forEach(collectCoords);
  }

  const geojson = data as any;

  if (geojson.type === "FeatureCollection") {
    geojson.features?.forEach((feature: any) => {
      collectCoords(feature.geometry?.coordinates);
    });
  } else if (geojson.type === "Feature") {
    collectCoords(geojson.geometry?.coordinates);
  } else {
    collectCoords(geojson.coordinates);
  }

  if (coordinates.length === 0) return null;

  return L.latLngBounds(coordinates);
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (event: LeafletMouseEvent) => void;
}) {
  useMapEvents({
    click: onMapClick,
  });

  return null;
}

function createFeatureCollection(
  features: Feature<Geometry>[]
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features,
  };
}