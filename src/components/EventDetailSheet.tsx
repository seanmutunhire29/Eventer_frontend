import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Category, Event } from '@/api/types';
import { CategoryBadge } from '@/components/glass/CategoryChip';
import { GlassButton } from '@/components/glass/GlassButton';
import { getCategoryColor } from '@/utils/categories';
import { formatEventTimeRange } from '@/utils/dates';
import { hasReminder, scheduleEventReminder } from '@/utils/notifications';
import { usePreferencesStore } from '@/store/preferencesStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface EventDetailSheetProps {
  event: Event | null;
  category?: Category;
  onDismiss: () => void;
  onHide: (eventId: string) => void;
  preview?: boolean;
  sheetIndex?: number;
}

export const EventDetailSheet = forwardRef<BottomSheet, EventDetailSheetProps>(
  function EventDetailSheet(
    { event, category, onDismiss, onHide, preview = false, sheetIndex = -1 },
    ref,
  ) {
    const snapPoints = useMemo(() => (preview ? ['30%', '78%'] : ['78%']), [preview]);
    const [reminderSet, setReminderSet] = useState(false);
    const defaultReminder = usePreferencesStore((s) => s.preferences.defaultReminderMinutes);

    useEffect(() => {
      if (event) {
        hasReminder(event.id).then(setReminderSet);
      }
    }, [event]);

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
      ),
      [],
    );

    const locationText =
      event?.building?.official_name ??
      event?.unresolved_location ??
      'Location TBD';

    const handleReminder = async () => {
      if (!event || !defaultReminder) return;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await scheduleEventReminder(event, defaultReminder);
      setReminderSet(true);
    };

    const handleDirections = () => {
      if (!event?.building) return;
      const { lat, lng } = event.building;
      const url = Platform.select({
        ios: `maps:0,0?q=${lat},${lng}`,
        android: `geo:${lat},${lng}?q=${lat},${lng}`,
        default: `https://maps.google.com/?q=${lat},${lng}`,
      });
      if (url) Linking.openURL(url);
    };

    const handleHide = async () => {
      if (!event) return;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onHide(event.id);
      onDismiss();
    };

    const handleMoreInfo = () => {
      if (event?.source_url) {
        WebBrowser.openBrowserAsync(event.source_url);
      }
    };

    if (!event) return null;

    const badges = [];
    if (event.other_info?.has_food) badges.push({ label: 'FREE FOOD', icon: 'restaurant' as const, color: colors.primaryContainer });
    if (event.other_info?.needs_registration) badges.push({ label: 'REGISTRATION REQUIRED', icon: 'app-registration' as const, color: colors.secondary });
    if (event.other_info?.needs_invite) badges.push({ label: 'INVITE ONLY', icon: 'lock' as const, color: colors.outline });
    if (event.other_info?.guests_allowed) badges.push({ label: 'GUESTS ALLOWED', icon: 'group' as const, color: colors.primary });

    return (
      <BottomSheet
        ref={ref}
        index={sheetIndex}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onDismiss}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView contentContainerStyle={styles.content}>
          {category && (
            <CategoryBadge slug={event.category} label={category.label} />
          )}

          <Text style={styles.title}>{event.event_name}</Text>

          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color={colors.onSurfaceVariant} />
              <Text style={styles.infoText}>{locationText}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="schedule" size={20} color={colors.onSurfaceVariant} />
              <Text style={styles.infoText}>
                {formatEventTimeRange(event.start_time, event.end_time)}
              </Text>
            </View>
          </View>

          {!preview && (
            <>
              {badges.length > 0 && (
                <View style={styles.badges}>
                  {badges.map((badge) => (
                    <View key={badge.label} style={styles.badge}>
                      <MaterialIcons name={badge.icon} size={14} color={badge.color} />
                      <Text style={[typography.labelBold, { color: badge.color, fontSize: 11 }]}>
                        {badge.label}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {event.description ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Description</Text>
                  <Text style={styles.description}>{event.description}</Text>
                </View>
              ) : null}

              {event.source_url ? (
                <Pressable onPress={handleMoreInfo} style={styles.moreInfo}>
                  <Text style={styles.moreInfoText}>View original event page</Text>
                  <MaterialIcons name="open-in-new" size={16} color={colors.primary} />
                </Pressable>
              ) : null}
            </>
          )}
        </BottomSheetScrollView>

        {!preview && (
          <View style={styles.actions}>
            <GlassButton
              variant="primary"
              onPress={handleReminder}
              style={styles.primaryAction}
            >
              <MaterialIcons
                name={reminderSet ? 'check-circle' : 'notifications-active'}
                size={20}
                color={colors.onPrimary}
              />
              <Text style={styles.primaryActionText}>
                {reminderSet ? 'REMINDER SET' : 'SET REMINDER'}
              </Text>
            </GlassButton>

            <View style={styles.secondaryActions}>
              <GlassButton
                variant="secondary"
                onPress={handleDirections}
                style={styles.secondaryAction}
                disabled={!event.building}
              >
                <MaterialIcons name="directions" size={20} color={colors.primary} />
                <Text style={styles.secondaryText}>DIRECTIONS</Text>
              </GlassButton>

              <GlassButton variant="secondary" onPress={handleHide} style={styles.secondaryAction}>
                <MaterialIcons name="visibility-off" size={20} color={colors.error} />
                <Text style={[styles.secondaryText, { color: colors.error }]}>HIDE EVENT</Text>
              </GlassButton>
            </View>
          </View>
        )}
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.glassFill,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 0.5,
    borderColor: colors.glassBorder,
  },
  handle: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 36,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: 160,
    gap: spacing.stackMd,
  },
  title: {
    ...typography.headlineMd,
  },
  infoRows: {
    gap: spacing.stackSm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  infoText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.stackSm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 0.5,
    borderColor: colors.glassBorder,
  },
  section: {
    gap: spacing.stackSm,
  },
  sectionLabel: {
    ...typography.labelBold,
    opacity: 0.6,
  },
  description: {
    ...typography.bodyLg,
  },
  moreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  moreInfoText: {
    ...typography.bodyMd,
    color: colors.primary,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.marginMobile,
    paddingBottom: spacing.stackXl,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: spacing.stackSm,
  },
  primaryAction: {
    width: '100%',
  },
  primaryActionText: {
    ...typography.labelBold,
    color: colors.onPrimary,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.stackSm,
  },
  secondaryAction: {
    flex: 1,
  },
  secondaryText: {
    ...typography.labelBold,
    color: colors.primary,
    fontSize: 11,
  },
});
