import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import type { CategorySlug } from '@/api/types';
import {
  CAMPUS_BOUNDS,
  CAMPUS_CENTER,
  CAMPUS_ZOOM,
  getTileConfig,
} from '@/config/mapConfig';
import { getCategoryColor, getCategoryGlyph } from '@/utils/categoryIcons';
import { buildLeafletHtml, type LeafletBadge } from './leafletHtml';

const buildingsGeoJson = require('../../../assets/geojson/dartmouth-buildings.json');

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  category: CategorySlug;
  /** Number of events represented by this badge (>1 shows a count indicator). */
  count: number;
}

interface CampusWebMapProps {
  markers: MapMarker[];
  selectedId?: string | null;
  onMarkerPress: (id: string) => void;
}

function toBadgePayload(markers: MapMarker[]): LeafletBadge[] {
  return markers.map((m) => ({
    id: m.id,
    lat: m.lat,
    lng: m.lng,
    color: getCategoryColor(m.category),
    glyph: getCategoryGlyph(m.category),
    count: m.count,
  }));
}

export function CampusWebMap({ markers, selectedId, onMarkerPress }: CampusWebMapProps) {
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);

  // Freeze the initial markers so the HTML (and thus the WebView) is built once;
  // later updates are pushed via injectJavaScript rather than reloading the page.
  const initialMarkers = useRef(toBadgePayload(markers)).current;

  const html = useMemo(() => {
    const tile = getTileConfig();
    return buildLeafletHtml({
      config: {
        tileUrl: tile.url,
        attribution: tile.attribution,
        center: CAMPUS_CENTER,
        bounds: CAMPUS_BOUNDS,
        zoom: CAMPUS_ZOOM,
      },
      geojson: buildingsGeoJson,
      markers: initialMarkers,
    });
  }, [initialMarkers]);

  const injectMarkers = useCallback(() => {
    const payload = toBadgePayload(markers);
    webRef.current?.injectJavaScript(
      `window.__setMarkers(${JSON.stringify(payload)}, ${JSON.stringify(selectedId ?? null)});true;`,
    );
  }, [markers, selectedId]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as {
          type: string;
          id?: string;
          msg?: string;
          level?: string;
        };
        if (data.type === 'ready') {
          setReady(true);
        } else if (data.type === 'markerPress' && data.id) {
          onMarkerPress(data.id);
        } else if (data.type === 'log') {
          const tag = data.level === 'error' ? '[WebMap ERROR]' : '[WebMap]';
          console.log(tag, data.msg);
        }
      } catch {
        // Ignore malformed messages from the WebView.
      }
    },
    [onMarkerPress],
  );

  useEffect(() => {
    if (ready) injectMarkers();
  }, [ready, injectMarkers]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        ref={webRef}
        source={{ html }}
        originWhitelist={['*']}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
        overScrollMode="never"
        bounces={false}
        scrollEnabled={false}
        allowsInlineMediaPlayback
        onError={(e) => console.log('[WebMap onError]', e.nativeEvent)}
        onHttpError={(e) =>
          console.log('[WebMap onHttpError]', e.nativeEvent.statusCode, e.nativeEvent.url)
        }
        onRenderProcessGone={() => console.log('[WebMap] render process gone')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#eef1ef',
  },
});
