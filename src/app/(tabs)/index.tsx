import { CampusMapScreen } from '@/components/CampusMapScreen';
import { reconcileReminders } from '@/utils/notifications';
import { useEvents } from '@/hooks';
import { useEffect } from 'react';

export default function MapTab() {
  const { events } = useEvents();

  useEffect(() => {
    if (events.length > 0) {
      reconcileReminders(events).catch(console.error);
    }
  }, [events]);

  return <CampusMapScreen />;
}
