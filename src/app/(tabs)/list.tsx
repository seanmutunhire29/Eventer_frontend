import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Event } from '@/api/types';
import { EventDetailSheet } from '@/components/EventDetailSheet';
import { DayChip } from '@/components/glass';
import { GlassCard } from '@/components/glass/GlassCard';
import { CategoryBadge } from '@/components/glass/CategoryChip';
import { useCategories, useDismissedEvents, useEvents, usePreferences } from '@/hooks';
import { getCategoryColor } from '@/utils/categories';
import { formatEventTimeShort, getDayFilterOptions } from '@/utils/dates';
import { filterEvents, getEventLocationLabel } from '@/utils/eventFilters';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function ListScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  const { events, isLoading } = useEvents();
  const { data: categories = [] } = useCategories();
  const { preferences } = usePreferences();
  const { dismissedIds, dismiss } = useDismissedEvents();

  const dayOptions = useMemo(() => getDayFilterOptions(), []);
  const [selectedDay, setSelectedDay] = useState<string>(() => dayOptions[0]?.key ?? '');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filteredEvents = useMemo(
    () =>
      filterEvents(events, {
        dismissedIds,
        enabledCategories: preferences.enabledCategories,
        selectedCategories: [],
        selectedDay,
        search,
      }).sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [events, dismissedIds, preferences.enabledCategories, selectedDay, search],
  );

  const selectedCategory = categories.find((c) => c.slug === selectedEvent?.category);

  const openEvent = (event: Event) => {
    setSelectedEvent(event);
    requestAnimationFrame(() => sheetRef.current?.snapToIndex(0));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.surfaceBright, colors.surfaceContainerLow]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <BlurView intensity={48} tint="light" style={StyleSheet.absoluteFill} />
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>All Events</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchRow}>
          <MaterialIcons name="search" size={20} color={colors.primary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search events or buildings..."
            placeholderTextColor={`${colors.onSurface}66`}
            style={styles.searchInput}
          />
        </View>

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

        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading events…' : 'No events match your filters.'}
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => openEvent(item)}>
              <GlassCard style={styles.card}>
                <View style={styles.cardRow}>
                  <CategoryBadge
                    slug={item.category}
                    label=""
                  />
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.event_name}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {formatEventTimeShort(item.start_time, item.end_time)}
                    </Text>
                    <View style={styles.locationRow}>
                      <MaterialIcons
                        name={item.building ? 'place' : 'help-outline'}
                        size={14}
                        color={item.building ? getCategoryColor(item.category) : colors.onSurfaceVariant}
                      />
                      <Text style={styles.cardLocation} numberOfLines={1}>
                        {getEventLocationLabel(item)}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
                </View>
              </GlassCard>
            </Pressable>
          )}
        />
      </SafeAreaView>

      <EventDetailSheet
        ref={sheetRef}
        event={selectedEvent}
        category={selectedCategory}
        preview={false}
        sheetIndex={selectedEvent ? 0 : -1}
        onDismiss={() => setSelectedEvent(null)}
        onHide={dismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    height: 64,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.glassBorder,
    overflow: 'hidden',
  },
  backButton: {
    padding: spacing.stackSm,
  },
  headerTitle: {
    ...typography.displayLgMobile,
    color: colors.primary,
  },
  headerSpacer: {
    width: 40,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    marginHorizontal: spacing.marginMobile,
    marginTop: spacing.stackMd,
    paddingHorizontal: spacing.stackMd,
    height: 44,
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: colors.glassBorder,
    backgroundColor: colors.surfaceContainerLowest,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  dayRow: {
    flexGrow: 0,
    marginTop: spacing.stackMd,
  },
  dayRowContent: {
    gap: spacing.stackSm,
    paddingHorizontal: spacing.marginMobile,
  },
  listContent: {
    padding: spacing.marginMobile,
    gap: spacing.stackMd,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.stackXl,
  },
  card: {
    marginBottom: spacing.stackMd,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackMd,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    ...typography.headlineSm,
    fontSize: 16,
    lineHeight: 21,
  },
  cardMeta: {
    ...typography.labelSm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardLocation: {
    ...typography.labelSm,
    flexShrink: 1,
  },
});
