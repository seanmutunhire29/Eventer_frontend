import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CategorySlug } from '@/api/types';
import { getCategoryColor, getCategoryIcon } from '@/utils/categories';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface CategoryChipProps {
  slug: CategorySlug;
  label: string;
  active: boolean;
  onPress: () => void;
}

export function CategoryChip({ slug, label, active, onPress }: CategoryChipProps) {
  const color = getCategoryColor(slug);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: color },
        active && { backgroundColor: `${color}33` },
      ]}
    >
      <MaterialIcons name={getCategoryIcon(slug)} size={14} color={color} />
      <Text style={[typography.labelBold, { color, textTransform: 'none', letterSpacing: 0 }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackXs,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
});

interface CategoryBadgeProps {
  slug: CategorySlug;
  label: string;
}

export function CategoryBadge({ slug, label }: CategoryBadgeProps) {
  const color = getCategoryColor(slug);

  return (
    <View style={badgeStyles.badgeRow}>
      <View style={[badgeStyles.badgeIcon, { backgroundColor: `${color}4D` }]}>
        <MaterialIcons name={getCategoryIcon(slug)} size={18} color={color} />
      </View>
      <Text style={[typography.labelBold, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
