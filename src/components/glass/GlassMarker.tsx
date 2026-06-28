import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import type { CategorySlug } from '@/api/types';
import { getCategoryColor, getCategoryIcon } from '@/utils/categories';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassMarkerProps {
  category: CategorySlug;
  onPress: () => void;
  selected?: boolean;
}

export function GlassMarker({ category, onPress, selected = false }: GlassMarkerProps) {
  const color = getCategoryColor(category);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 12 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12 });
      }}
      style={[styles.marker, selected && styles.markerSelected, animatedStyle]}
    >
      <View style={[styles.iconWrap, { borderColor: selected ? color : 'rgba(255,255,255,0.5)' }]}>
        <MaterialIcons name={getCategoryIcon(category)} size={22} color={color} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSelected: {
    zIndex: 10,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});
