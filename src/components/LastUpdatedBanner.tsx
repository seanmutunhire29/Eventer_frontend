import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { formatLastUpdated } from '@/utils/dates';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface LastUpdatedBannerProps {
  lastSyncedAt: string | null;
  fromCache: boolean;
}

export function LastUpdatedBanner({ lastSyncedAt, fromCache }: LastUpdatedBannerProps) {
  if (!fromCache || !lastSyncedAt) return null;

  return (
    <View style={styles.banner}>
      <MaterialIcons name="cloud-off" size={16} color={colors.onSurfaceVariant} />
      <Text style={styles.text}>
        Offline · Last updated {formatLastUpdated(lastSyncedAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.stackSm,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.stackMd,
    paddingVertical: spacing.stackSm,
    borderRadius: spacing.stackSm,
    marginHorizontal: spacing.marginMobile,
    marginTop: spacing.stackSm,
  },
  text: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
});
