export interface GeoJsonFeature {
  type: 'Feature';
  properties: {
    name: string;
    geojson_id?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJsonCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export function extractPolygons(feature: GeoJsonFeature): { latitude: number; longitude: number }[][] {
  if (feature.geometry.type === 'Polygon') {
    const ring = feature.geometry.coordinates[0] as number[][];
    return [ring.map(([lng, lat]) => ({ latitude: lat, longitude: lng }))];
  }

  const polygons: { latitude: number; longitude: number }[][] = [];
  for (const polygon of feature.geometry.coordinates as number[][][][]) {
    const ring = polygon[0];
    polygons.push(ring.map(([lng, lat]) => ({ latitude: lat, longitude: lng })));
  }
  return polygons;
}

export function getFeatureId(feature: GeoJsonFeature): string {
  return feature.properties.geojson_id ?? feature.properties.name;
}
