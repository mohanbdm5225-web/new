import type { GeoJsonObject } from "geojson";

export function parseGeoJSON(text: string): GeoJsonObject | null {
  try {
    const parsed = JSON.parse(text);

    if (
      parsed.type === "FeatureCollection" ||
      parsed.type === "Feature" ||
      parsed.type === "Point" ||
      parsed.type === "LineString" ||
      parsed.type === "Polygon" ||
      parsed.type === "MultiPolygon" ||
      parsed.type === "MultiLineString" ||
      parsed.type === "MultiPoint"
    ) {
      return parsed as GeoJsonObject;
    }

    return null;
  } catch {
    return null;
  }
}