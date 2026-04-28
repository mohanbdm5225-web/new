"use client";

import type { ChangeEvent } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { Upload } from "lucide-react";

import { useGIS } from "@/lib/gis/use-gis-store";

const colors = [
  "#7c3aed",
  "#16a34a",
  "#dc2626",
  "#f97316",
  "#0891b2",
  "#2563eb",
  "#9333ea",
];

export function FileUploadGIS() {
  const { addLayer } = useGIS();

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const text = await file.text();
      const extension = file.name.split(".").pop()?.toLowerCase();

      let geojson: FeatureCollection;

      if (extension === "geojson" || extension === "json") {
        geojson = normalizeGeoJson(JSON.parse(text));
      } else if (extension === "kml") {
        geojson = parseKmlToGeoJson(text, file.name);
      } else {
        continue;
      }

      const enhancedGeoJson = addMeasurementsToGeoJson(geojson);

      addLayer({
        id: crypto.randomUUID(),
        name: file.name,
        data: enhancedGeoJson,
        color: colors[index % colors.length],
      });
    }

    event.target.value = "";
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Upload className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-900">Upload GIS Files</h3>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 px-4 py-5 text-center transition hover:bg-indigo-100">
        <Upload className="h-7 w-7 text-indigo-600" />
        <span className="mt-2 text-sm font-bold text-slate-900">
          Choose KML / GeoJSON Files
        </span>
        <span className="mt-1 text-xs text-slate-500">
          Multiple file upload supported
        </span>

        <input
          type="file"
          multiple
          accept=".kml,.geojson,.json,application/vnd.google-earth.kml+xml,application/json"
          onChange={handleFiles}
          className="hidden"
        />
      </label>

      <p className="mt-3 text-xs text-slate-500">
        Supported: KML, GeoJSON. Area and length will be calculated
        automatically after upload.
      </p>
    </div>
  );
}

function normalizeGeoJson(data: any): FeatureCollection {
  if (data.type === "FeatureCollection") return data;

  if (data.type === "Feature") {
    return {
      type: "FeatureCollection",
      features: [data],
    };
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: data,
      },
    ],
  };
}

function parseKmlToGeoJson(kmlText: string, fileName: string): FeatureCollection {
  const parser = new DOMParser();
  const xml = parser.parseFromString(kmlText, "text/xml");
  const placemarks = Array.from(xml.getElementsByTagName("Placemark"));

  const features: Feature<Geometry>[] = [];

  placemarks.forEach((placemark, index) => {
    const name =
      placemark.getElementsByTagName("name")[0]?.textContent?.trim() ||
      `${fileName} Feature ${index + 1}`;

    const point = placemark.getElementsByTagName("Point")[0];
    const line = placemark.getElementsByTagName("LineString")[0];
    const polygon = placemark.getElementsByTagName("Polygon")[0];

    if (point) {
      const coordinatesText =
        point.getElementsByTagName("coordinates")[0]?.textContent || "";
      const coordinates = parseKmlCoordinates(coordinatesText)[0];

      if (coordinates) {
        features.push({
          type: "Feature",
          properties: { name },
          geometry: {
            type: "Point",
            coordinates,
          },
        });
      }
    }

    if (line) {
      const coordinatesText =
        line.getElementsByTagName("coordinates")[0]?.textContent || "";
      const coordinates = parseKmlCoordinates(coordinatesText);

      if (coordinates.length >= 2) {
        features.push({
          type: "Feature",
          properties: { name },
          geometry: {
            type: "LineString",
            coordinates,
          },
        });
      }
    }

    if (polygon) {
      const coordinatesText =
        polygon.getElementsByTagName("coordinates")[0]?.textContent || "";
      let coordinates = parseKmlCoordinates(coordinatesText);

      if (coordinates.length >= 3) {
        const first = coordinates[0];
        const last = coordinates[coordinates.length - 1];

        if (first[0] !== last[0] || first[1] !== last[1]) {
          coordinates = [...coordinates, first];
        }

        features.push({
          type: "Feature",
          properties: { name },
          geometry: {
            type: "Polygon",
            coordinates: [coordinates],
          },
        });
      }
    }
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

function parseKmlCoordinates(text: string): [number, number][] {
  return text
    .trim()
    .split(/\s+/)
    .map((item) => {
      const [lon, lat] = item.split(",").map(Number);
      return [lon, lat] as [number, number];
    })
    .filter(
      ([lon, lat]) =>
        Number.isFinite(lon) &&
        Number.isFinite(lat) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lon) <= 180
    );
}

function addMeasurementsToGeoJson(data: FeatureCollection): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: data.features.map((feature) => {
      const properties = {
        ...(feature.properties || {}),
      };

      const geometry: any = feature.geometry;

      if (!geometry) {
        return feature;
      }

      if (geometry.type === "Point") {
        properties.measurementType = "Point";
        properties.longitude = geometry.coordinates[0];
        properties.latitude = geometry.coordinates[1];
      }

      if (geometry.type === "LineString") {
        const lengthKm = calculateLineLengthKm(geometry.coordinates || []);
        properties.measurementType = "Line";
        properties.lengthM = lengthKm * 1000;
        properties.lengthKm = lengthKm;
      }

      if (geometry.type === "Polygon") {
        const ring = geometry.coordinates?.[0] || [];
        const areaSqKm = calculatePolygonAreaSqKm(ring);
        properties.measurementType = "Area";
        properties.areaSqKm = areaSqKm;
        properties.areaHa = areaSqKm * 100;
        properties.areaAcres = areaSqKm * 247.105381;
      }

      return {
        ...feature,
        properties,
      };
    }),
  };
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