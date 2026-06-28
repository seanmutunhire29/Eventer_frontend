/** Manual overrides when OSM names differ from backend geojson_id values. */
export const GEOJSON_ID_OVERRIDES: Record<string, string> = {
  'baker-berry-library': 'baker-berry-library',
  'collis-center': 'collis-center',
  'hopkins-center': 'hopkins-center',
  'class-of-1953-commons': 'class-of-1953-commons',
  'life-sciences-center': 'life-sciences-center',
};

export function normalizeGeojsonId(id: string): string {
  return GEOJSON_ID_OVERRIDES[id] ?? id;
}
