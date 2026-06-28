import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CategorySlug, ReminderOffset, ThemeMode, UserPreferences } from '@/api/types';
import { ALL_CATEGORY_SLUGS } from '@/api/types';
import { GlassButton, GlassCard } from '@/components/glass';
import { usePreferences } from '@/hooks';
import { requestNotificationPermissions } from '@/utils/notifications';
import { CATEGORY_LABELS, getCategoryColor } from '@/utils/categories';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const REMINDER_OPTIONS: { label: string; value: ReminderOffset }[] = [
  { label: '5m', value: 5 },
  { label: '10m', value: 10 },
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: 'None', value: null },
];

const THEME_OPTIONS: ThemeMode[] = ['light', 'dark', 'system'];

export default function SettingsScreen() {
  const { preferences, hydrated, save } = usePreferences();
  const [draft, setDraft] = useState<UserPreferences>(preferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (hydrated) {
      setDraft(preferences);
    }
  }, [hydrated, preferences]);

  const toggleCategory = (slug: CategorySlug) => {
    setDraft((prev) => ({
      ...prev,
      enabledCategories: prev.enabledCategories.includes(slug)
        ? prev.enabledCategories.filter((s) => s !== slug)
        : [...prev.enabledCategories, slug],
    }));
  };

  const handleSave = async () => {
    if (draft.pushNotifications) {
      await requestNotificationPermissions();
    }
    await save(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Section title="Appearance">
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLabel}>
                  <MaterialIcons name="palette" size={20} color={colors.onSurfaceVariant} />
                  <Text style={styles.rowText}>Theme</Text>
                </View>
                <View style={styles.themePicker}>
                  {THEME_OPTIONS.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => setDraft((p) => ({ ...p, theme: option }))}
                      style={[
                        styles.themeOption,
                        draft.theme === option && styles.themeOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.themeOptionText,
                          draft.theme === option && styles.themeOptionTextActive,
                        ]}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </GlassCard>
          </Section>

          <Section title="Notifications">
            <GlassCard style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.rowText}>Push Notifications</Text>
                  <Text style={styles.rowSubtext}>Stay updated on new events</Text>
                </View>
                <Switch
                  value={draft.pushNotifications}
                  onValueChange={(value) =>
                    setDraft((p) => ({ ...p, pushNotifications: value }))
                  }
                  trackColor={{ true: colors.primaryContainer, false: colors.outlineVariant }}
                  thumbColor={colors.onPrimary}
                />
              </View>

              <View style={styles.divider} />

              <Text style={styles.rowText}>Default Reminder</Text>
              <View style={styles.reminderGrid}>
                {REMINDER_OPTIONS.map((option) => (
                  <Pressable
                    key={option.label}
                    onPress={() =>
                      setDraft((p) => ({ ...p, defaultReminderMinutes: option.value }))
                    }
                    style={[
                      styles.reminderOption,
                      draft.defaultReminderMinutes === option.value &&
                        styles.reminderOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.reminderText,
                        draft.defaultReminderMinutes === option.value &&
                          styles.reminderTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </GlassCard>
          </Section>

          <Section title="Event Preferences">
            <GlassCard style={styles.card}>
              {ALL_CATEGORY_SLUGS.map((slug) => (
                <View key={slug} style={styles.categoryRow}>
                  <View style={styles.categoryLabel}>
                    <View
                      style={[styles.categoryDot, { backgroundColor: getCategoryColor(slug) }]}
                    />
                    <Text style={styles.rowText}>{CATEGORY_LABELS[slug]}</Text>
                  </View>
                  <Switch
                    value={draft.enabledCategories.includes(slug)}
                    onValueChange={() => toggleCategory(slug)}
                    trackColor={{ true: colors.primaryContainer, false: colors.outlineVariant }}
                    thumbColor={colors.onPrimary}
                  />
                </View>
              ))}
            </GlassCard>
          </Section>

          <GlassButton variant="primary" onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>{saved ? 'Saved!' : 'Save Changes'}</Text>
          </GlassButton>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
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
  content: {
    padding: spacing.marginMobile,
    paddingBottom: 120,
    gap: spacing.stackLg,
  },
  section: {
    gap: spacing.stackSm,
  },
  sectionTitle: {
    ...typography.labelBold,
    color: colors.outline,
    paddingHorizontal: spacing.stackSm,
  },
  card: {
    padding: spacing.stackMd,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.stackMd,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  rowText: {
    ...typography.bodyMd,
    fontFamily: 'Inter_600SemiBold',
  },
  rowSubtext: {
    ...typography.labelSm,
    marginTop: 2,
  },
  themePicker: {
    flexDirection: 'row',
    backgroundColor: colors.glassFill,
    borderRadius: 999,
    padding: 4,
    borderWidth: 0.5,
    borderColor: colors.glassBorder,
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  themeOptionActive: {
    backgroundColor: colors.primary,
  },
  themeOptionText: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    textTransform: 'capitalize',
  },
  themeOptionTextActive: {
    color: colors.onPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginVertical: spacing.stackMd,
  },
  reminderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.stackSm,
    marginTop: spacing.stackSm,
  },
  reminderOption: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassFill,
    alignItems: 'center',
  },
  reminderOptionActive: {
    borderColor: `${colors.primary}4D`,
    backgroundColor: `${colors.primary}1A`,
  },
  reminderText: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
    textTransform: 'none',
  },
  reminderTextActive: {
    color: colors.primary,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.stackXs,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  saveButton: {
    width: '100%',
    borderRadius: 16,
  },
  saveText: {
    ...typography.headlineSm,
    color: colors.onPrimary,
  },
});
