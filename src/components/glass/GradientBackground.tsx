import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

export function GradientBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.blob, styles.blobGreen]} />
      <View style={[styles.blob, styles.blobPurple]} />
      <View style={[styles.blob, styles.blobPink]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobGreen: {
    top: '10%',
    left: '-15%',
    width: '70%',
    height: '50%',
    backgroundColor: colors.primaryContainer,
    opacity: 0.25,
  },
  blobPurple: {
    bottom: '5%',
    right: '-15%',
    width: '60%',
    height: '60%',
    backgroundColor: colors.secondary,
    opacity: 0.2,
  },
  blobPink: {
    top: '50%',
    left: '50%',
    width: '40%',
    height: '30%',
    backgroundColor: '#D91B5C',
    opacity: 0.08,
    transform: [{ translateX: -80 }, { translateY: -60 }],
  },
});
