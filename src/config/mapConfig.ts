import Constants from 'expo-constants';

/**
 * Stadia Maps API key. Resolved from the public env var first, falling back to
 * the static value in app.json -> expo.extra.stadiaApiKey. NOTE: EXPO_PUBLIC_*
 * values are embedded in the app bundle at build time, so this is not a hard
 * secret (Stadia keys are meant to be client-side + domain/property scoped).
 */
export const STADIA_API_KEY: string =
  process.env.EXPO_PUBLIC_STADIA_API_KEY ??
  (Constants.expoConfig?.extra?.stadiaApiKey as string | undefined) ??
  '';

/** Stadia "Alidade Smooth" raster tile template. `{r}` yields @2x on retina. */
export const STADIA_TILE_URL =
  'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key={key}';

export const STADIA_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Resolves the tile URL with the configured API key substituted in. */
export function getStadiaTileUrl(): string {
  return STADIA_TILE_URL.replace('{key}', STADIA_API_KEY);
}

export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const hasStadiaKey = STADIA_API_KEY.trim().length > 0;

/**
 * Tile layer for the map. Uses Stadia "Alidade Smooth" when an API key is
 * configured; otherwise falls back to plain OpenStreetMap tiles (which need no
 * key) so the map always renders during development.
 */
export function getTileConfig(): { url: string; attribution: string } {
  if (hasStadiaKey) {
    return { url: getStadiaTileUrl(), attribution: STADIA_ATTRIBUTION };
  }
  return { url: OSM_TILE_URL, attribution: OSM_ATTRIBUTION };
}

/** Center of the Dartmouth College campus (Hanover, NH). */
export const CAMPUS_CENTER = {
  latitude: 43.7044,
  longitude: -72.2887,
} as const;

/**
 * Bounding box enclosing the Hanover / Dartmouth campus area. The Leaflet map
 * uses this as `maxBounds` so the user cannot pan away from campus.
 */
export const CAMPUS_BOUNDS = {
  northEast: { latitude: 43.7125, longitude: -72.2765 },
  southWest: { latitude: 43.6965, longitude: -72.3005 },
} as const;

export const CAMPUS_ZOOM = {
  initial: 16,
  min: 15,
  max: 18,
} as const;
