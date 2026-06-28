import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { eventerApi } from '@/api/client';
import type { Building, Category, Event } from '@/api/types';
import {
  cacheBuildings,
  cacheCategories,
  cacheEvents,
  getCachedBuildings,
  getCachedCategories,
  getCachedEvents,
  getSyncMetadata,
} from '@/db/repository';
import { usePreferencesStore } from '@/store/preferencesStore';

const EVENTS_KEY = ['events'];
const BUILDINGS_KEY = ['buildings'];
const CATEGORIES_KEY = ['categories'];

const THIRTY_MINUTES = 30 * 60 * 1000;

async function fetchEventsWithCache(): Promise<{ events: Event[]; fromCache: boolean; lastSyncedAt: string | null }> {
  try {
    const events = await eventerApi.getEvents({ days: 7 });
    await cacheEvents(events);
    const lastSyncedAt = await getSyncMetadata('last_synced_at');
    return { events, fromCache: false, lastSyncedAt };
  } catch {
    const cached = await getCachedEvents();
    const lastSyncedAt = await getSyncMetadata('last_synced_at');
    if (cached.length > 0) {
      return { events: cached, fromCache: true, lastSyncedAt };
    }
    throw new Error('Unable to load events. Check your connection and try again.');
  }
}

export function useEvents() {
  const query = useQuery({
    queryKey: EVENTS_KEY,
    queryFn: fetchEventsWithCache,
    refetchInterval: THIRTY_MINUTES,
    staleTime: 5 * 60 * 1000,
  });

  return {
    events: query.data?.events ?? [],
    fromCache: query.data?.fromCache ?? false,
    lastSyncedAt: query.data?.lastSyncedAt ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}

async function fetchBuildingsWithCache(): Promise<Building[]> {
  try {
    const buildings = await eventerApi.getBuildings();
    await cacheBuildings(buildings);
    return buildings;
  } catch {
    return getCachedBuildings();
  }
}

export function useBuildings() {
  return useQuery({
    queryKey: BUILDINGS_KEY,
    queryFn: fetchBuildingsWithCache,
    staleTime: 60 * 60 * 1000,
  });
}

async function fetchCategoriesWithCache(): Promise<Category[]> {
  try {
    const categories = await eventerApi.getCategories();
    await cacheCategories(categories);
    return categories;
  } catch {
    return getCachedCategories();
  }
}

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: fetchCategoriesWithCache,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useInvalidateEvents() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: EVENTS_KEY });
}

export function useOnboardingStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let mounted = true;
    import('@/db/repository').then(({ isOnboardingComplete }) => {
      isOnboardingComplete().then((complete) => {
        if (mounted) {
          setIsComplete(complete);
          setIsLoading(false);
        }
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { isLoading, isComplete, setIsComplete };
}

export function useDismissedEvents() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import('@/db/repository').then(({ getDismissedEventIds }) => {
      getDismissedEventIds().then((ids) => {
        setDismissedIds(ids);
        setLoaded(true);
      });
    });
  }, []);

  const dismiss = async (eventId: string) => {
    const { dismissEvent } = await import('@/db/repository');
    await dismissEvent(eventId);
    setDismissedIds((prev) => [...prev, eventId]);
  };

  return { dismissedIds, loaded, dismiss };
}


export function usePreferences() {
  const { preferences, hydrated, setPreferences, setHydrated } = usePreferencesStore();

  useEffect(() => {
    import('@/db/repository').then(({ getUserPreferences }) => {
      getUserPreferences().then((prefs) => {
        setPreferences(prefs);
        setHydrated(true);
      });
    });
  }, [setHydrated, setPreferences]);

  const save = async (prefs: typeof preferences) => {
    const { saveUserPreferences } = await import('@/db/repository');
    await saveUserPreferences(prefs);
    setPreferences(prefs);
  };

  return { preferences, hydrated, save };
}
