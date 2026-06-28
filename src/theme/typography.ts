import { TextStyle } from 'react-native';

import { colors } from './colors';

export const typography = {
  displayLgMobile: {
    fontFamily: 'Sora_700Bold',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.onSurface,
  } satisfies TextStyle,
  headlineMd: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '600',
    color: colors.onSurface,
  } satisfies TextStyle,
  headlineSm: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: colors.onSurface,
  } satisfies TextStyle,
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
  } satisfies TextStyle,
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    color: colors.onSurface,
  } satisfies TextStyle,
  labelBold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.onSurface,
  } satisfies TextStyle,
  labelSm: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 11,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  } satisfies TextStyle,
} as const;
