import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Event, ReminderOffset } from '@/api/types';
import { deleteReminder, getReminderForEvent, saveReminder } from '@/db/repository';
import { getReminderDate } from '@/utils/dates';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Event Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  return true;
}

export async function scheduleEventReminder(
  event: Event,
  offsetMinutes: ReminderOffset,
): Promise<string | null> {
  if (!offsetMinutes) return null;

  const reminderDate = getReminderDate(event.start_time, offsetMinutes);
  if (!reminderDate) return null;

  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  const existing = await getReminderForEvent(event.id);
  if (existing?.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(existing.notificationId);
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: event.event_name,
      body: `Starting in ${offsetMinutes} minutes`,
      data: { eventId: event.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: Platform.OS === 'android' ? 'reminders' : undefined,
    },
  });

  await saveReminder(
    event.id,
    notificationId,
    reminderDate.toISOString(),
    offsetMinutes,
  );

  return notificationId;
}

export async function cancelEventReminder(eventId: string) {
  const existing = await getReminderForEvent(eventId);
  if (existing?.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(existing.notificationId);
    await deleteReminder(eventId);
  }
}

export async function reconcileReminders(events: Event[]) {
  const { getReminders } = await import('@/db/repository');
  const scheduled = await getReminders();

  for (const reminder of scheduled) {
    const event = events.find((item) => item.id === reminder.eventId);
    if (!event) {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      await deleteReminder(reminder.eventId);
      continue;
    }

    const expected = getReminderDate(event.start_time, reminder.offsetMinutes);
    if (!expected || expected.toISOString() !== reminder.scheduledFor) {
      await scheduleEventReminder(event, reminder.offsetMinutes as ReminderOffset);
    }
  }
}

export async function hasReminder(eventId: string): Promise<boolean> {
  const reminder = await getReminderForEvent(eventId);
  return Boolean(reminder);
}
