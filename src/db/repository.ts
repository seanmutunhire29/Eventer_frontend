import { eq } from 'drizzle-orm';

import type { Building, Category, Event, UserPreferences } from '@/api/types';
import { DEFAULT_PREFERENCES } from '@/api/types';
import { getDb } from '@/db/client';
import {
  cachedBuildings,
  cachedCategories,
  cachedEvents,
  dismissedEvents,
  preferences,
  reminders,
  syncMetadata,
} from '@/db/schema';

export async function getSyncMetadata(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.select().from(syncMetadata).where(eq(syncMetadata.key, key)).get();
  return row?.value ?? null;
}

export async function setSyncMetadata(key: string, value: string) {
  const db = await getDb();
  await db
    .insert(syncMetadata)
    .values({ key, value })
    .onConflictDoUpdate({ target: syncMetadata.key, set: { value } });
}

export async function cacheEvents(events: Event[]) {
  const db = await getDb();
  const now = new Date().toISOString();
  for (const event of events) {
    await db
      .insert(cachedEvents)
      .values({ id: event.id, data: JSON.stringify(event), updatedAt: event.updated_at })
      .onConflictDoUpdate({
        target: cachedEvents.id,
        set: { data: JSON.stringify(event), updatedAt: event.updated_at },
      });
  }
  await setSyncMetadata('last_synced_at', now);
}

export async function getCachedEvents(): Promise<Event[]> {
  const db = await getDb();
  const rows = await db.select().from(cachedEvents);
  return rows.map((row) => JSON.parse(row.data) as Event);
}

export async function cacheBuildings(buildings: Building[]) {
  const db = await getDb();
  for (const building of buildings) {
    await db
      .insert(cachedBuildings)
      .values({ id: building.id, data: JSON.stringify(building) })
      .onConflictDoUpdate({
        target: cachedBuildings.id,
        set: { data: JSON.stringify(building) },
      });
  }
}

export async function getCachedBuildings(): Promise<Building[]> {
  const db = await getDb();
  const rows = await db.select().from(cachedBuildings);
  return rows.map((row) => JSON.parse(row.data) as Building);
}

export async function cacheCategories(categories: Category[]) {
  const db = await getDb();
  for (const category of categories) {
    await db
      .insert(cachedCategories)
      .values({ slug: category.slug, data: JSON.stringify(category) })
      .onConflictDoUpdate({
        target: cachedCategories.slug,
        set: { data: JSON.stringify(category) },
      });
  }
}

export async function getCachedCategories(): Promise<Category[]> {
  const db = await getDb();
  const rows = await db.select().from(cachedCategories);
  return rows.map((row) => JSON.parse(row.data) as Category);
}

export async function isOnboardingComplete(): Promise<boolean> {
  const value = await getPreference('onboarding_completed');
  return value === 'true';
}

export async function setOnboardingComplete() {
  await setPreference('onboarding_completed', 'true');
}

export async function getPreference(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.select().from(preferences).where(eq(preferences.key, key)).get();
  return row?.value ?? null;
}

export async function setPreference(key: string, value: string) {
  const db = await getDb();
  await db
    .insert(preferences)
    .values({ key, value })
    .onConflictDoUpdate({ target: preferences.key, set: { value } });
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const raw = await getPreference('user_preferences');
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function saveUserPreferences(prefs: UserPreferences) {
  await setPreference('user_preferences', JSON.stringify(prefs));
}

export async function getDismissedEventIds(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.select().from(dismissedEvents);
  return rows.map((row) => row.eventId);
}

export async function dismissEvent(eventId: string) {
  const db = await getDb();
  await db
    .insert(dismissedEvents)
    .values({ eventId, dismissedAt: new Date().toISOString() })
    .onConflictDoNothing();
}

export async function getReminders() {
  const db = await getDb();
  return db.select().from(reminders);
}

export async function saveReminder(
  eventId: string,
  notificationId: string,
  scheduledFor: string,
  offsetMinutes: number,
) {
  const db = await getDb();
  await db
    .insert(reminders)
    .values({ eventId, notificationId, scheduledFor, offsetMinutes })
    .onConflictDoUpdate({
      target: reminders.eventId,
      set: { notificationId, scheduledFor, offsetMinutes },
    });
}

export async function deleteReminder(eventId: string) {
  const db = await getDb();
  await db.delete(reminders).where(eq(reminders.eventId, eventId));
}

export async function getReminderForEvent(eventId: string) {
  const db = await getDb();
  return db.select().from(reminders).where(eq(reminders.eventId, eventId)).get();
}
