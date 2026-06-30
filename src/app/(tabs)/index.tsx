import { Suspense, lazy, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useEvents } from '@/hooks';
import { colors } from '@/theme/colors';
import { reconcileReminders } from '@/utils/notifications';

const CampusMapScreen = lazy(() =>
  import('@/components/CampusMapScreen').then((mod) => ({ default: mod.CampusMapScreen })),
);

export default function MapTab() {
  const { events } = useEvents();

  useEffect(() => {
    if (events.length > 0) {
      reconcileReminders(events).catch(console.error);
    }
  }, [events]);

  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      }
    >
      <CampusMapScreen />
    </Suspense>
  );
}
