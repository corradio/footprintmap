import {max, min, mean} from "../pkg/lodash.js";
export function getCenteredLocationViewport([longitude, latitude]) {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    latitude,
    longitude,
    zoom: 4
  };
}
export function getCenteredZoneViewport(zone) {
  const longitudes = [];
  const latitudes = [];
  zone.geometry.coordinates.forEach((geojson) => {
    geojson[0].forEach(([longitude, latitude]) => {
      longitudes.push(longitude);
      latitudes.push(latitude);
    });
  });
  return getCenteredLocationViewport([
    mean([min(longitudes), max(longitudes)]),
    mean([min(latitudes), max(latitudes)])
  ]);
}
