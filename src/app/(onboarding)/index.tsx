import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassButton, GlassCard, GradientBackground } from '@/components/glass';
import { setOnboardingComplete } from '@/db/repository';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'event-note' as const,
    title: 'Welcome to Eventer',
    body: 'Your companion for never missing out on campus life.',
  },
  {
    icon: 'map' as const,
    title: 'Explore the Campus Map',
    body: 'Discover events happening across Dartmouth, right where they take place.',
  },
  {
    icon: 'notifications-active' as const,
    title: 'Never Miss Out',
    body: 'Set reminders and customize your feed so the events you care about find you.',
  },
];

function FloatingIcon({ icon }: { icon: React.ComponentProps<typeof MaterialIcons>['name'] }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(withTiming(-10, { duration: 2000 }), withTiming(0, { duration: 2000 })),
      -1,
      true,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <MaterialIcons name={icon} size={48} color={colors.onPrimary} />
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const finishOnboarding = async () => {
    await setOnboardingComplete();
    router.replace('/(tabs)');
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      finishOnboarding();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.surfaceBright, colors.surfaceContainerLow]}
        style={StyleSheet.absoluteFill}
      />
      <GradientBackground />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.skipRow}>
          <GlassButton variant="glass" onPress={finishOnboarding}>
            <Text style={styles.skipText}>SKIP</Text>
          </GlassButton>
        </View>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <GlassCard style={styles.card}>
                <FloatingIcon icon={item.icon} />
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>

                <View style={styles.dots}>
                  {SLIDES.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === activeIndex ? styles.dotActive : styles.dotInactive,
                      ]}
                    />
                  ))}
                </View>
              </GlassCard>
            </View>
          )}
        />

        <View style={styles.ctaWrap}>
          <GlassButton variant="primary" onPress={goNext} style={styles.cta}>
            <Text style={styles.ctaText}>
              {activeIndex === SLIDES.length - 1 ? "Let's Go" : 'Continue'}
            </Text>
            <MaterialIcons name="arrow-forward" size={22} color={colors.onPrimary} />
          </GlassButton>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceBright,
  },
  safeArea: {
    flex: 1,
  },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.stackMd,
  },
  skipText: {
    ...typography.labelBold,
    color: colors.primary,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
  },
  card: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: spacing.radiusGlass,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.stackLg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    ...typography.displayLgMobile,
    textAlign: 'center',
    marginBottom: spacing.stackMd,
  },
  body: {
    ...typography.bodyLg,
    textAlign: 'center',
    paddingHorizontal: spacing.stackMd,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.stackSm,
    marginTop: spacing.stackXl,
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: `${colors.primary}33`,
  },
  ctaWrap: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.stackLg,
  },
  cta: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    minHeight: 64,
  },
  ctaText: {
    ...typography.headlineSm,
    color: colors.onPrimary,
  },
});
