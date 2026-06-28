import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const syncMetadata = sqliteTable('sync_metadata', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const cachedEvents = sqliteTable('cached_events', {
  id: text('id').primaryKey(),
  data: text('data').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const cachedBuildings = sqliteTable('cached_buildings', {
  id: integer('id').primaryKey(),
  data: text('data').notNull(),
});

export const cachedCategories = sqliteTable('cached_categories', {
  slug: text('slug').primaryKey(),
  data: text('data').notNull(),
});

export const dismissedEvents = sqliteTable('dismissed_events', {
  eventId: text('event_id').primaryKey(),
  dismissedAt: text('dismissed_at').notNull(),
});

export const preferences = sqliteTable('preferences', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const reminders = sqliteTable('reminders', {
  eventId: text('event_id').primaryKey(),
  notificationId: text('notification_id').notNull(),
  scheduledFor: text('scheduled_for').notNull(),
  offsetMinutes: integer('offset_minutes').notNull(),
});
