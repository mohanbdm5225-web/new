"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  ScaleControl,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type {
  LatLngBoundsExpression,
  LatLngExpression,
  LeafletMouseEvent,
} from "leaflet";
import L from "leaflet";
import type { ElementType } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import {
  BarChart3,
  Building2,
  Crosshair,
  Download,
  Layers,
  MapPinned,
  MousePointer2,
  Pentagon,
  Route,
  Ruler,
  Trash2,
  Upload,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

import { Button } from "@/components/ui/button";
import { fixLeafletIcons } from "@/lib/gis/leaflet-fix";
import { useGIS } from "@/lib/gis/use-gis-store";
import { GisTool } from "@/lib/gis/types";

import { FileUploadGIS } from "./file-upload-gis";
import { LayerPanel } from "./layer-panel";
import { StyleEditor } from "./style-editor";
import { ExportMap } from "./export-map";

const tools: { id: GisTool; label: string; icon: ElementType }[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "point", label: "Point", icon: Crosshair },
  { id: "line", label: "Line", icon: Route },
  { id: "polygon", label: "Polygon", icon: Pentagon },
  { id: "measure", label: "Measure", icon: Ruler },
];

const basemaps = {
  street: {
    label: "Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
  topo: {
    label: "Topo",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenTopoMap contributors",
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
};

type BasemapKey = keyof typeof basemaps;

export function GisWorkspace() {
  const { layers, addLayer, activeTool, setActiveTool, clearAllLayers } =
    useGIS();

  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measurement, setMeasurement] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [basemap, setBasemap] = useState<BasemapKey>("satellite");
  const [cursor, setCursor] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const visibleLayers = useMemo(
    () => layers.filter((layer) => layer.visible),
    [layers]
  );

  const stats = useMemo(() => getLayerStats(visibleLayers), [visibleLayers]);
  const selectedBasemap = basemaps[basemap];

  function handleMapClick(event: LeafletMouseEvent) {
    const clicked: [number, number] = [event.latlng.lng, event.latlng.lat];

    if (activeTool === "point") {
      addLayer({
        id: crypto.randomUUID(),
        name: `Survey Point-${layers.length + 1}`,
        data: createFeatureCollection([
          {
            type: "Feature",
            properties: {
              name: `Survey Point-${layers.length + 1}`,
              latitude: event.latlng.lat,
              longitude: event.latlng.lng,
              measurementType: "Point",
            },
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
        const lengthKm = calculateLineLengthKm(nextPoints);

        addLayer({
          id: crypto.randomUUID(),
          name: `Line - ${lengthKm.toFixed(3)} km`,
          data: createFeatureCollection([
            {
              type: "Feature",
              properties: {
                name: "Drawn Line",
                measurementType: "Line",
                lengthM: lengthKm * 1000,
                lengthKm,
              },
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
        const areaSqKm = calculatePolygonAreaSqKm(closedPoints);

        addLayer({
          id: crypto.randomUUID(),
          name: `Area - ${(areaSqKm * 247.105381).toFixed(2)} acres`,
          data: createFeatureCollection([
            {
              type: "Feature",
              properties: {
                name: "Drawn Polygon",
                measurementType: "Area",
                areaSqKm,
                areaHa: areaSqKm * 100,
                areaAcres: areaSqKm * 247.105381,
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
        const lengthKm = calculateLineLengthKm(nextPoints);
        setMeasurement(
          `${(lengthKm * 1000).toFixed(2)} m / ${lengthKm.toFixed(3)} km`
        );

        addLayer({
          id: crypto.randomUUID(),
          name: `Measurement - ${lengthKm.toFixed(3)} km`,
          data: createFeatureCollection([
            {
              type: "Feature",
              properties: {
                name: "Measurement",
                measurementType: "Line",
                lengthM: lengthKm * 1000,
                lengthKm,
              },
              geometry: { type: "LineString", coordinates: nextPoints },
            },
          ]),
          color: "#f97316",
        });

        setMeasurePoints([]);
      }
    }
  }

  function exportSummaryCSV() {
    const rows = [
      ["GIS Summary"],
      ["Total Layers", layers.length],
      ["Visible Layers", visibleLayers.length],
      ["Points", stats.points],
      ["Lines", stats.lines],
      ["Polygons", stats.polygons],
      ["Total Area Sq.Km", stats.areaSqKm.toFixed(6)],
      ["Total Area Hectares", stats.areaHa.toFixed(3)],
      ["Total Area Acres", stats.areaAcres.toFixed(3)],
      ["Total Length Meter", stats.lengthM.toFixed(2)],
      ["Total Length Kilometer", stats.lengthKm.toFixed(4)],
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "gis-measurement-summary.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-soft">
      {sidebarOpen && (
        <aside className="w-[390px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white">
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
                  KML, GeoJSON, measurement, drawing and layer control
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <Link
              href="/gis/NHAI"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Building2 className="h-4 w-4" />
              Open NHAI Projects
            </Link>

            <FileUploadGIS />

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Measurement Summary
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <SummaryBox label="Layers" value={visibleLayers.length} />
                <SummaryBox label="Points" value={stats.points} />
                <SummaryBox label="Lines" value={stats.lines} />
                <SummaryBox label="Polygons" value={stats.polygons} />
                <SummaryBox
                  label="Area Acres"
                  value={stats.areaAcres.toFixed(3)}
                />
                <SummaryBox
                  label="Area Hectare"
                  value={stats.areaHa.toFixed(3)}
                />
                <SummaryBox
                  label="Area Sq.Km"
                  value={stats.areaSqKm.toFixed(6)}
                />
                <SummaryBox
                  label="Length Km"
                  value={stats.lengthKm.toFixed(4)}
                />
              </div>

              <Button
                onClick={exportSummaryCSV}
                className="mt-3 w-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Download className="h-4 w-4" />
                Export Measurement CSV
              </Button>
            </div>

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
        <div className="absolute left-6 top-4 z-[1000] flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
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

        <div className="absolute right-6 top-4 z-[1000] flex gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
          {(Object.keys(basemaps) as BasemapKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setBasemap(key)}
              className={`rounded-xl px-3 py-2 text-xs font-bold ${
                basemap === key
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {basemaps[key].label}
            </button>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 z-[1000] grid gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm shadow-lg backdrop-blur">
            <p className="font-semibold text-slate-900">
              Active Tool: <span className="text-indigo-600">{activeTool}</span>
            </p>
            <p className="text-xs text-slate-500">
              Layers: {layers.length} | Visible: {visibleLayers.length}
            </p>
            {cursor && (
              <p className="mt-1 text-xs text-slate-500">
                Lat: {cursor.lat.toFixed(6)} | Long: {cursor.lng.toFixed(6)}
              </p>
            )}
            {measurement && (
              <p className="mt-1 text-xs font-bold text-amber-600">
                Last Distance: {measurement}
              </p>
            )}
          </div>
        </div>

        <MapContainer
          center={[13.0827, 80.2707] as LatLngExpression}
          zoom={10}
          zoomControl={false}
          className="h-full w-full"
          preferCanvas
        >
          <TileLayer
            key={basemap}
            attribution={selectedBasemap.attribution}
            url={selectedBasemap.url}
          />

          <ZoomControl position="bottomright" />
          <ScaleControl position="bottomright" />

          <MapClickHandler
            onMapClick={handleMapClick}
            onMouseMove={(lat, lng) => setCursor({ lat, lng })}
          />
          <AutoZoomToLayers layers={visibleLayers} />
          <ResizeMapOnChange dependency={sidebarOpen} />

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
              onEachFeature={(feature, leafletLayer) => {
                const props = feature.properties || {};
                leafletLayer.bindPopup(buildMeasurementPopup(layer.name, props));
              }}
            />
          ))}
        </MapContainer>

        {layers.length === 0 && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
            <div className="max-w-md rounded-3xl border border-slate-200 bg-white/95 p-6 text-center shadow-xl backdrop-blur">
              <Upload className="mx-auto h-10 w-10 text-indigo-600" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">
                Import GIS layers
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Upload one or multiple KML / GeoJSON files. Area, length and
                coordinates will be calculated automatically.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-3">
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-900">{value}</p>
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
      maxZoom: 18,
    });
  }, [layers, map]);

  return null;
}

function ResizeMapOnChange({ dependency }: { dependency: boolean }) {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [dependency, map]);

  return null;
}

function MapClickHandler({
  onMapClick,
  onMouseMove,
}: {
  onMapClick: (event: LeafletMouseEvent) => void;
  onMouseMove: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: onMapClick,
    mousemove: (event) => {
      onMouseMove(event.latlng.lat, event.latlng.lng);
    },
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

function getLayerStats(layers: ReturnType<typeof useGIS>["layers"]) {
  let points = 0;
  let lines = 0;
  let polygons = 0;
  let areaSqKm = 0;
  let lengthKm = 0;

  function handleGeometry(geometry: any) {
    if (!geometry) return;

    if (geometry.type === "Point") points += 1;

    if (geometry.type === "MultiPoint") {
      points += geometry.coordinates?.length || 0;
    }

    if (geometry.type === "LineString") {
      lines += 1;
      lengthKm += calculateLineLengthKm(geometry.coordinates || []);
    }

    if (geometry.type === "MultiLineString") {
      for (const line of geometry.coordinates || []) {
        lines += 1;
        lengthKm += calculateLineLengthKm(line);
      }
    }

    if (geometry.type === "Polygon") {
      polygons += 1;
      areaSqKm += calculatePolygonAreaSqKm(geometry.coordinates?.[0] || []);
    }

    if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates || []) {
        polygons += 1;
        areaSqKm += calculatePolygonAreaSqKm(polygon?.[0] || []);
      }
    }
  }

  for (const layer of layers) {
    const data: any = layer.data;

    if (data.type === "FeatureCollection") {
      for (const feature of data.features || []) {
        handleGeometry(feature.geometry);
      }
    } else if (data.type === "Feature") {
      handleGeometry(data.geometry);
    } else {
      handleGeometry(data);
    }
  }

  return {
    points,
    lines,
    polygons,
    areaSqKm,
    areaHa: areaSqKm * 100,
    areaAcres: areaSqKm * 247.105381,
    lengthKm,
    lengthM: lengthKm * 1000,
  };
}

function buildMeasurementPopup(layerName: string, props: any) {
  const lines = [
    `<strong>${props.name || "GIS Feature"}</strong>`,
    `Layer: ${layerName}`,
  ];

  if (props.measurementType) {
    lines.push(`Type: ${props.measurementType}`);
  }

  if (typeof props.latitude === "number" && typeof props.longitude === "number") {
    lines.push(`Latitude: ${props.latitude.toFixed(8)}`);
    lines.push(`Longitude: ${props.longitude.toFixed(8)}`);
  }

  if (typeof props.areaSqKm === "number") {
    lines.push(`Area Acres: ${props.areaAcres?.toFixed(3)}`);
    lines.push(`Area Hectares: ${props.areaHa?.toFixed(3)}`);
    lines.push(`Area Sq.Km: ${props.areaSqKm?.toFixed(6)}`);
  }

  if (typeof props.lengthKm === "number") {
    lines.push(`Length Meter: ${props.lengthM?.toFixed(2)}`);
    lines.push(`Length Km: ${props.lengthKm?.toFixed(4)}`);
  }

  return lines.join("<br/>");
}

function calculateLineLengthKm(coordinates: [number, number][]) {
  let total = 0;

  for (let i = 1; i < coordinates.length; i++) {
    total += haversineKm(
      coordinates[i - 1][1],
      coordinates[i - 1][0],
      coordinates[i][1],
      coordinates[i][0]
    );
  }

  return total;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadiusKm = 6371.0088;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculatePolygonAreaSqKm(coordinates: [number, number][]) {
  if (coordinates.length < 4) return 0;

  const earthRadiusM = 6371008.8;
  let area = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lon1, lat1] = coordinates[i];
    const [lon2, lat2] = coordinates[i + 1];

    area +=
      toRad(lon2 - lon1) *
      (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }

  const areaSqM = Math.abs((area * earthRadiusM * earthRadiusM) / 2);
  return areaSqM / 1_000_000;
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}