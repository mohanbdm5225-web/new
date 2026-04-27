import type { GeoJsonObject } from "geojson";

export type GisTool = "select" | "point" | "line" | "polygon" | "measure";

export type GisLayer = {
  id: string;
  name: string;
  data: GeoJsonObject;
  visible: boolean;
  color: string;
  createdAt: string;
};

/*
  Compatibility export:
  If any old file imports GISLayer, it will still work.
*/
export type GISLayer = GisLayer;