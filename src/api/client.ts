import Constants from 'expo-constants';

import type { Building, Category, Event } from './types';

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ??
  Constants.expoConfig?.extra?.apiUrl ??
  'http://localhost:8000';

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
    return apiGet<Event[]>(`/api/events/${query ? `?${query}` : ''}`);
  },

  getEvent: (id: string) => apiGet<Event>(`/api/events/${id}/`),

  getBuildings: () => apiGet<Building[]>('/api/buildings/'),

  getCategories: () => apiGet<Category[]>('/api/categories/'),
};

export { API_BASE };
