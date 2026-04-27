import type { Feature, FeatureCollection, Geometry } from "geojson";

export function parseKML(text: string): FeatureCollection | null {
  try {
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    const placemarks = Array.from(xml.getElementsByTagName("Placemark"));

    const features: Feature<Geometry>[] = placemarks
      .map((placemark) => {
        const name =
          placemark.getElementsByTagName("name")[0]?.textContent ||
          "KML Feature";

        const coordinatesText =
          placemark.getElementsByTagName("coordinates")[0]?.textContent;

        if (!coordinatesText) return null;

        const coords = coordinatesText
          .trim()
          .split(/\s+/)
          .map((coord) => {
            const [lng, lat] = coord.split(",").map(Number);
            return [lng, lat];
          });

        // Detect geometry type
        if (placemark.getElementsByTagName("Point").length) {
          return {
            type: "Feature",
            properties: { name },
            geometry: {
              type: "Point",
              coordinates: coords[0],
            },
          };
        }

        if (placemark.getElementsByTagName("LineString").length) {
          return {
            type: "Feature",
            properties: { name },
            geometry: {
              type: "LineString",
              coordinates: coords,
            },
          };
        }

        if (placemark.getElementsByTagName("Polygon").length) {
          return {
            type: "Feature",
            properties: { name },
            geometry: {
              type: "Polygon",
              coordinates: [coords],
            },
          };
        }

        return null;
      })
      .filter(Boolean) as Feature<Geometry>[];

    return {
      type: "FeatureCollection",
      features,
    };
  } catch {
    return null;
  }
}