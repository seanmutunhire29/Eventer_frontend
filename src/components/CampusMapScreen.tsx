import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CategorySlug, Event } from '@/api/types';
import { EventDetailSheet } from '@/components/EventDetailSheet';
import { LastUpdatedBanner } from '@/components/LastUpdatedBanner';
import { CategoryChip, GlassMarker, GlassPill } from '@/components/glass';
import {
  useCategories,
  useDismissedEvents,
  useEvents,
  usePreferences,
} from '@/hooks';
import { CATEGORY_LABELS } from '@/utils/categories';
import { extractPolygons, getFeatureId, type GeoJsonCollection } from '@/utils/geojson';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const campusGeoJson = require('../../assets/geojson/dartmouth-campus.geojson') as GeoJsonCollection;

const DARTMOUTH_REGION = {
  latitude: 43.7044,
  longitude: -72.2887,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const geoJson = campusGeoJson as GeoJsonCollection;

export function CampusMapScreen() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const filterSheetRef = useRef<BottomSheet>(null);

  const { events, fromCache, lastSyncedAt, isLoading, isError, error, refetch, isRefetching } = useEvents();
  const { data: categories = [] } = useCategories();
  const { preferences } = usePreferences();
  const { dismissedIds, dismiss } = useDismissedEvents();

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategorySlug[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [highlightedBuildingId, setHighlightedBuildingId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      if (dismissedIds.includes(event.id)) return false;
      if (!preferences.enabledCategories.includes(event.category)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(event.category)) {
        return false;
      }
      if (!query) return true;
      const buildingName = event.building?.official_name?.toLowerCase() ?? '';
      const aliases =
        event.building?.aliases.map((a) => a.alias.toLowerCase()).join(' ') ?? '';
      return (
        event.event_name.toLowerCase().includes(query) ||
        buildingName.includes(query) ||
        aliases.includes(query) ||
        (event.unresolved_location?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [events, dismissedIds, preferences.enabledCategories, selectedCategories, search]);

  const mapEvents = filteredEvents.filter((event) => event.building);

  const selectedCategory = categories.find((c) => c.slug === selectedEvent?.category);

  const openEvent = (event: Event) => {
    setSelectedEvent(event);
    setHighlightedBuildingId(event.building?.geojson_id ?? null);
    requestAnimationFrame(() => {
      sheetRef.current?.snapToIndex(0);
    });
  };

  const toggleCategoryFilter = (slug: CategorySlug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={DARTMOUTH_REGION}
        mapType="mutedStandard"
      >
        {geoJson.features.map((feature) => {
          const featureId = getFeatureId(feature);
          const isHighlighted = featureId === highlightedBuildingId;
          return extractPolygons(feature).map((coordinates, index) => (
            <Polygon
              key={`${featureId}-${index}`}
              coordinates={coordinates}
              fillColor={isHighlighted ? 'rgba(0, 105, 62, 0.25)' : 'rgba(0, 105, 62, 0.05)'}
              strokeColor={isHighlighted ? 'rgba(0, 105, 62, 0.4)' : 'rgba(0, 105, 62, 0.15)'}
              strokeWidth={2}
            />
          ));
        })}

        {mapEvents.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.building!.lat,
              longitude: event.building!.lng,
            }}
            onPress={() => openEvent(event)}
            tracksViewChanges={false}
          >
            <GlassMarker
              category={event.category}
              selected={selectedEvent?.id === event.id}
              onPress={() => openEvent(event)}
            />
          </Marker>
        ))}
      </MapView>

      <View style={[styles.topBanner, { top: insets.top }]}>
        <LastUpdatedBanner lastSyncedAt={lastSyncedAt} fromCache={fromCache} />
        {isLoading && !isError && (
          <Text style={styles.loadingText}>Loading events…</Text>
        )}
        {isError && (
          <Pressable onPress={() => refetch()} style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={18} color={colors.error} />
            <Text style={styles.errorText}>
              {error instanceof Error ? error.message : 'Failed to load events'}
            </Text>
            <Text style={styles.retryText}>{isRefetching ? 'Retrying…' : 'Tap to retry'}</Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.bottomBar, { bottom: insets.bottom + 24 }]}>
        <GlassPill onPress={() => router.push('/settings')} size={48}>
          <MaterialIcons name="settings" size={22} color={colors.onSurface} />
        </GlassPill>

        <View style={styles.searchPill}>
          <BlurView intensity={54} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.searchOverlay} />
          <MaterialIcons name="search" size={20} color={colors.primary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search events or buildings..."
            placeholderTextColor={`${colors.onSurface}66`}
            style={styles.searchInput}
          />
        </View>

        <GlassPill onPress={() => filterSheetRef.current?.expand()} size={48}>
          <MaterialIcons name="tune" size={22} color={colors.onSurface} />
        </GlassPill>
      </View>

      <EventDetailSheet
        ref={sheetRef}
        event={selectedEvent}
        category={selectedCategory}
        preview={false}
        sheetIndex={selectedEvent ? 0 : -1}
        onDismiss={() => {
          setSelectedEvent(null);
          setHighlightedBuildingId(null);
        }}
        onHide={dismiss}
      />

      <BottomSheet
        ref={filterSheetRef}
        index={-1}
        snapPoints={['45%']}
        enablePanDownToClose
        backgroundStyle={styles.filterSheet}
      >
        <BottomSheetScrollView contentContainerStyle={styles.filterContent}>
          <Text style={styles.filterTitle}>Filter by Category</Text>
          <View style={styles.chipGrid}>
            {categories.map((category) => (
              <CategoryChip
                key={category.slug}
                slug={category.slug}
                label={CATEGORY_LABELS[category.slug] ?? category.label}
                active={selectedCategories.includes(category.slug)}
                onPress={() => toggleCategoryFilter(category.slug)}
              />
            ))}
          </View>
          {selectedCategories.length > 0 && (
            <Pressable onPress={() => setSelectedCategories([])} style={styles.clearFilters}>
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </Pressable>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
  },
  topBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  loadingText: {
    ...typography.bodyMd,
    textAlign: 'center',
    marginTop: spacing.stackSm,
    color: colors.onSurfaceVariant,
  },
  errorBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.stackSm,
    backgroundColor: colors.errorContainer,
    marginHorizontal: spacing.marginMobile,
    marginTop: spacing.stackSm,
    padding: spacing.stackMd,
    borderRadius: spacing.stackSm,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
    flex: 1,
  },
  retryText: {
    ...typography.labelBold,
    color: colors.error,
    textTransform: 'none',
  },
  bottomBar: {
    position: 'absolute',
    left: spacing.marginMobile,
    right: spacing.marginMobile,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gutterMobile,
    zIndex: 20,
  },
  searchPill: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.stackMd,
    gap: spacing.stackSm,
    borderWidth: 0.5,
    borderColor: colors.glassBorder,
  },
  searchOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.glassFill,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  filterSheet: {
    backgroundColor: colors.surfaceBright,
    borderTopLeftRadius: spacing.radiusGlass,
    borderTopRightRadius: spacing.radiusGlass,
  },
  filterContent: {
    padding: spacing.marginMobile,
    gap: spacing.stackMd,
  },
  filterTitle: {
    ...typography.headlineSm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.stackSm,
  },
  clearFilters: {
    alignSelf: 'center',
    padding: spacing.stackSm,
  },
  clearFiltersText: {
    ...typography.bodyMd,
    color: colors.primary,
  },
});
