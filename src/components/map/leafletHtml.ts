export interface LeafletConfig {
  tileUrl: string;
  attribution: string;
  center: { latitude: number; longitude: number };
  bounds: {
    northEast: { latitude: number; longitude: number };
    southWest: { latitude: number; longitude: number };
  };
  zoom: { initial: number; min: number; max: number };
}

export interface LeafletBadge {
  id: string;
  lat: number;
  lng: number;
  color: string;
  glyph: string;
  count: number;
}

interface BuildHtmlParams {
  config: LeafletConfig;
  geojson: unknown;
  markers: LeafletBadge[];
}

/**
 * Full HTML document for the map WebView. Config, GeoJSON, and the initial
 * markers are embedded directly so the map self-initializes on load (no
 * postMessage handshake needed for the first render). The RN side can still
 * push marker updates via `window.__setMarkers(...)` and receives marker taps,
 * readiness, and log/error events back over `postMessage`.
 */
export function buildLeafletHtml({ config, geojson, markers }: BuildHtmlParams): string {
  const configJson = JSON.stringify(config);
  const geojsonJson = JSON.stringify(geojson);
  const markersJson = JSON.stringify(markers);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,500,0,0" />
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #eef1ef; }
    #map { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
    .leaflet-container { background: #eef1ef; font-family: -apple-system, system-ui, sans-serif; }
    .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,0.6); }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      display: inline-block;
      white-space: nowrap;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
    }

    .badge {
      width: 34px;
      height: 34px;
      border-radius: 17px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.62);
      -webkit-backdrop-filter: blur(8px) saturate(140%);
      backdrop-filter: blur(8px) saturate(140%);
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
      position: relative;
      transition: transform 0.12s ease, background 0.12s ease;
    }
    .badge .material-symbols-outlined { font-size: 20px; }
    .badge .fallback-dot { width: 14px; height: 14px; border-radius: 7px; background: currentColor; }
    .badge-selected {
      transform: scale(1.14);
      background: rgba(255, 255, 255, 0.78);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.24);
      z-index: 1000;
    }
    .badge-count {
      position: absolute;
      top: -5px;
      right: -5px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      box-sizing: border-box;
      border-radius: 8px;
      background: var(--accent, #00693E);
      color: #fff;
      font: 700 10px/16px -apple-system, system-ui, sans-serif;
      text-align: center;
      border: 1.5px solid rgba(255, 255, 255, 0.92);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function post(obj) {
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(obj));
        }
      } catch (e) {}
    }
    function rnlog() {
      post({ type: 'log', msg: Array.prototype.join.call(arguments, ' ') });
    }
    window.onerror = function (message, source, lineno, colno) {
      post({ type: 'log', level: 'error', msg: 'onerror: ' + message + ' @' + lineno + ':' + colno });
      return false;
    };
  </script>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    onerror="post({type:'log',level:'error',msg:'Failed to load Leaflet JS from CDN'});"></script>
  <script>
    (function () {
      var CONFIG = ${configJson};
      var GEOJSON = ${geojsonJson};
      var MARKERS = ${markersJson};

      var map = null;
      var tileLayer = null;
      var geoLayer = null;
      var markerLayer = null;
      var buildingLayers = [];
      var lastMarkers = MARKERS || [];
      var lastSelected = null;

      var baseStyle = { color: 'rgba(0, 105, 62, 0.35)', weight: 1, fillColor: '#00693E', fillOpacity: 0.05 };
      var activeStyle = { color: 'rgba(0, 105, 62, 0.6)', weight: 1.5, fillColor: '#00693E', fillOpacity: 0.18 };

      function pointInRing(lng, lat, ring) {
        var inside = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          var xi = ring[i][0], yi = ring[i][1];
          var xj = ring[j][0], yj = ring[j][1];
          var intersect = ((yi > lat) !== (yj > lat)) &&
            (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        return inside;
      }
      function pointInPolygonCoords(lng, lat, coords) {
        if (!coords.length || !pointInRing(lng, lat, coords[0])) return false;
        for (var k = 1; k < coords.length; k++) {
          if (pointInRing(lng, lat, coords[k])) return false;
        }
        return true;
      }
      function pointInFeature(lng, lat, feature) {
        var g = feature && feature.geometry;
        if (!g) return false;
        if (g.type === 'Polygon') return pointInPolygonCoords(lng, lat, g.coordinates);
        if (g.type === 'MultiPolygon') {
          for (var p = 0; p < g.coordinates.length; p++) {
            if (pointInPolygonCoords(lng, lat, g.coordinates[p])) return true;
          }
        }
        return false;
      }

      function badgeHtml(m, selected) {
        var accent = m.color || '#00693E';
        var count = m.count > 1 ? '<span class="badge-count">' + m.count + '</span>' : '';
        var cls = 'badge' + (selected ? ' badge-selected' : '');
        var border = selected ? accent : 'rgba(255,255,255,0.6)';
        return '<div class="' + cls + '" style="--accent:' + accent + ';border-color:' + border + '">' +
          '<span class="material-symbols-outlined" style="color:' + accent + '">' + (m.glyph || 'event') + '</span>' +
          count +
          '</div>';
      }

      window.__initMap = function (cfg) {
        if (map) return;
        var sw = [cfg.bounds.southWest.latitude, cfg.bounds.southWest.longitude];
        var ne = [cfg.bounds.northEast.latitude, cfg.bounds.northEast.longitude];
        map = L.map('map', {
          zoomControl: false,
          attributionControl: true,
          maxBounds: [sw, ne],
          maxBoundsViscosity: 1.0,
          minZoom: cfg.zoom.min,
          maxZoom: cfg.zoom.max,
        });
        map.setView([cfg.center.latitude, cfg.center.longitude], cfg.zoom.initial);
        tileLayer = L.tileLayer(cfg.tileUrl, {
          attribution: cfg.attribution,
          maxZoom: cfg.zoom.max,
          detectRetina: true,
        });
        tileLayer.on('tileerror', function () { rnlog('tileerror: a map tile failed to load'); });
        tileLayer.addTo(map);
      };

      window.__setGeoJSON = function (data) {
        if (!map) return;
        if (geoLayer) geoLayer.remove();
        buildingLayers = [];
        geoLayer = L.geoJSON(data, {
          style: function () { return baseStyle; },
          onEachFeature: function (feature, layer) {
            buildingLayers.push({ feature: feature, layer: layer });
          },
        }).addTo(map);
      };

      window.__setMarkers = function (markers, selectedId) {
        lastMarkers = markers || [];
        lastSelected = selectedId || null;
        if (!map) return;

        if (markerLayer) markerLayer.remove();
        markerLayer = L.layerGroup().addTo(map);

        for (var b = 0; b < buildingLayers.length; b++) {
          buildingLayers[b].layer.setStyle(baseStyle);
        }

        lastMarkers.forEach(function (m) {
          for (var i = 0; i < buildingLayers.length; i++) {
            if (pointInFeature(m.lng, m.lat, buildingLayers[i].feature)) {
              buildingLayers[i].layer.setStyle(activeStyle);
              break;
            }
          }
          var selected = !!(lastSelected && m.id === lastSelected);
          var icon = L.divIcon({
            className: '',
            html: badgeHtml(m, selected),
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });
          var marker = L.marker([m.lat, m.lng], { icon: icon });
          marker.on('click', (function (id) {
            return function () { post({ type: 'markerPress', id: id }); };
          })(m.id));
          marker.addTo(markerLayer);
        });
      };

      window.__setSelected = function (selectedId) {
        window.__setMarkers(lastMarkers, selectedId);
      };

      function boot() {
        if (!window.L) {
          post({ type: 'log', level: 'error', msg: 'Leaflet (window.L) is undefined - CDN did not load' });
          return;
        }
        try {
          window.__initMap(CONFIG);
          window.__setGeoJSON(GEOJSON);
          window.__setMarkers(MARKERS, null);
          post({ type: 'ready' });
        } catch (e) {
          post({ type: 'log', level: 'error', msg: 'init failed: ' + (e && e.message ? e.message : e) });
        }
      }

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        boot();
      } else {
        window.addEventListener('DOMContentLoaded', boot);
      }
    })();
  </script>
</body>
</html>`;
}
