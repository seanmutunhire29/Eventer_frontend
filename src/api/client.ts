import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { Building, Category, Event } from './types';

/** Dev machine host from Metro (e.g. 192.168.1.5) — used when localhost won't work. */
function getDevMachineHost(): string | null {
  const raw =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri ??
    null;
  if (!raw) return null;
  const host = raw.split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return host;
}

function resolveApiBase(): string {
  const configured = (
    process.env.EXPO_PUBLIC_API_URL ??
    (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
    'http://localhost:8000'
  ).replace(/\/$/, '');

  const isLocalhost =
    configured.includes('localhost') || configured.includes('127.0.0.1');

  if (!isLocalhost) return configured;

  // Android emulator: localhost is the emulator itself; host machine is 10.0.2.2
  if (Platform.OS === 'android') {
    return configured
      .replace('localhost', '10.0.2.2')
      .replace('127.0.0.1', '10.0.2.2');
  }

  // Physical device (Expo Go): use the same LAN IP Metro uses
  const devHost = getDevMachineHost();
  if (devHost && Platform.OS !== 'web' && Constants.isDevice) {
    return `http://${devHost}:8000`;
  }

  return configured;
}

const API_BASE = resolveApiBase();

if (__DEV__) {
  console.log('[Eventer API]', API_BASE);
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const eventerApi = {
  getEvents: (params?: {
    days?: number;
    date?: string;
    category?: string;
    since?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.days != null) qs.set('days', String(params.days));
    if (params?.date) qs.set('date', params.date);
    if (params?.category) qs.set('category', params.category);
    if (params?.since) qs.set('since', params.since);
    const query = qs.toString();
    return apiGet<Event[]>(query ? `/api/events/?${query}` : '/api/events/');
  },

  getEvent: (id: string) => apiGet<Event>(`/api/events/${id}/`),

  getBuildings: () => apiGet<Building[]>('/api/buildings/'),

  getCategories: () => apiGet<Category[]>('/api/categories/'),
};

export { API_BASE };
