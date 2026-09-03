// @refresh reset
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CategorySlug, Event } from '@/api/types';
import { EventDetailSheet } from '@/components/EventDetailSheet';
import { LastUpdatedBanner } from '@/components/LastUpdatedBanner';
import { CampusWebMap, type MapMarker } from '@/components/map/CampusWebMap';
import { CategoryChip, DayChip, GlassPill } from '@/components/glass';
import {
  useCategories,
  useDismissedEvents,
  useEvents,
  usePreferences,
} from '@/hooks';
import { CATEGORY_LABELS } from '@/utils/categories';
import { getDayFilterOptions } from '@/utils/dates';
import { filterEvents } from '@/utils/eventFilters';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function CampusMapScreen() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const filterSheetRef = useRef<BottomSheet>(null);

  const { events, fromCache, lastSyncedAt, isLoading, isError, error, refetch, isRefetching } = useEvents();
  const { data: categories = [] } = useCategories();
  const { preferences } = usePreferences();
  const { dismissedIds, dismiss } = useDismissedEvents();

  const dayOptions = useMemo(() => getDayFilterOptions(), []);
  const [selectedDay, setSelectedDay] = useState<string>(() => dayOptions[0]?.key ?? '');
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategorySlug[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredEvents = useMemo(
    () =>
      filterEvents(events, {
        dismissedIds,
        enabledCategories: preferences.enabledCategories,
        selectedCategories,
        selectedDay,
        search,
      }),
    [events, dismissedIds, preferences.enabledCategories, selectedCategories, selectedDay, search],
  );

  const mapEvents = useMemo(() => filteredEvents.filter((event) => event.building), [filteredEvents]);

  // One badge per building; badges with >1 event show a count indicator.
  const markers = useMemo<MapMarker[]>(() => {
    const groups = new Map<string, { rep: Event; count: number }>();
    const sorted = [...mapEvents].sort((a, b) => a.start_time.localeCompare(b.start_time));
    for (const ev of sorted) {
      const b = ev.building!;
      const key = b.geojson_id || `${b.lat},${b.lng}`;
      const existing = groups.get(key);
      if (existing) existing.count += 1;
      else groups.set(key, { rep: ev, count: 1 });
    }
    return Array.from(groups.values()).map(({ rep, count }) => ({
      id: rep.id,
      lat: rep.building!.lat,
      lng: rep.building!.lng,
      category: rep.category,
      count,
    }));
  }, [mapEvents]);

  const selectedCategory = categories.find((c) => c.slug === selectedEvent?.category);

  const openEvent = useCallback((event: Event) => {
    setSelectedEvent(event);
    requestAnimationFrame(() => {
      sheetRef.current?.snapToIndex(0);
    });
  }, []);

  const openEventById = useCallback(
    (id: string) => {
      const ev = events.find((e) => e.id === id);
      if (ev) openEvent(ev);
    },
    [events, openEvent],
  );

  const toggleCategoryFilter = (slug: CategorySlug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const renderFilterBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <CampusWebMap
        markers={markers}
        selectedId={selectedEvent?.id ?? null}
        onMarkerPress={openEventById}
      />

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

      {!selectedEvent && (
        <View style={[styles.bottomWrap, { bottom: insets.bottom + 24 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dayRow}
            contentContainerStyle={styles.dayRowContent}
          >
            {dayOptions.map((option) => (
              <DayChip
                key={option.key}
                label={option.label}
                active={selectedDay === option.key}
                onPress={() => setSelectedDay(option.key)}
              />
            ))}
          </ScrollView>

          <View style={styles.navBar}>
            <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.navOverlay} />

            <GlassPill onPress={() => router.push('/settings')} size={44}>
              <MaterialIcons name="settings" size={22} color={colors.onSurface} />
            </GlassPill>

            <View style={styles.searchPill}>
              <MaterialIcons name="search" size={20} color={colors.primary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search events or buildings..."
                placeholderTextColor={`${colors.onSurface}66`}
                style={styles.searchInput}
              />
            </View>

            <GlassPill onPress={() => setFilterOpen(true)} size={44}>
              <MaterialIcons name="tune" size={22} color={colors.onSurface} />
            </GlassPill>

            <GlassPill onPress={() => router.push('/list')} size={44}>
              <MaterialIcons name="list" size={22} color={colors.onSurface} />
            </GlassPill>
          </View>
        </View>
      )}

      <EventDetailSheet
        ref={sheetRef}
        event={selectedEvent}
        category={selectedCategory}
        preview={false}
        sheetIndex={selectedEvent ? 0 : -1}
        onDismiss={() => {
          setSelectedEvent(null);
        }}
        onHide={dismiss}
      />

      <BottomSheet
        ref={filterSheetRef}
        index={filterOpen ? 0 : -1}
        snapPoints={['45%']}
        enableDynamicSizing={false}
        enablePanDownToClose
        backdropComponent={renderFilterBackdrop}
        onClose={() => setFilterOpen(false)}
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
  bottomWrap: {
    position: 'absolute',
    left: spacing.marginMobile,
    right: spacing.marginMobile,
    zIndex: 20,
  },
  dayRow: {
    flexGrow: 0,
    marginBottom: spacing.gutterMobile,
  },
  dayRowContent: {
    gap: spacing.stackSm,
    paddingRight: spacing.stackMd,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.gutterMobile,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  navOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  searchPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.stackMd,
    gap: spacing.stackSm,
    borderWidth: 0.5,
    borderColor: colors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
