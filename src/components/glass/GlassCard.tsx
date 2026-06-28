import { BlurView } from 'expo-blur';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface GlassCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  dark?: boolean;
}

export function GlassCard({ children, style, intensity = 50, dark = false }: GlassCardProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView
        intensity={intensity}
        tint={dark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.overlay,
          dark && styles.overlayDark,
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: spacing.radiusGlass,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.glassFill,
  },
  overlayDark: {
    backgroundColor: colors.glassFillDark,
  },
  content: {
    padding: spacing.stackXl,
  },
});
