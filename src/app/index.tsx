import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useOnboardingStatus } from '@/hooks';
import { colors } from '@/theme/colors';

export default function Index() {
  const { isLoading, isComplete } = useOnboardingStatus();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isComplete) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(tabs)" />;
}
