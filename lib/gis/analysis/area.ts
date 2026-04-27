export function calculatePolygonAreaSqKm(coordinates: [number, number][]) {
  if (coordinates.length < 4) return 0;

  const radius = 6371000;
  let area = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lon1, lat1] = coordinates[i];
    const [lon2, lat2] = coordinates[i + 1];

    area +=
      toRad(lon2 - lon1) *
      (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }

  area = Math.abs((area * radius * radius) / 2);

  return area / 1_000_000;
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}