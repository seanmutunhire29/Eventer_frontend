import { drizzle, ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import * as schema from './schema';

let dbInstance: ExpoSQLiteDatabase<typeof schema> | null = null;

export async function getDb() {
  if (!dbInstance) {
    const sqlite = await SQLite.openDatabaseAsync('eventer.db');
    await sqlite.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS sync_metadata (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS cached_events (
        id TEXT PRIMARY KEY NOT NULL,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS cached_buildings (
        id INTEGER PRIMARY KEY NOT NULL,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS cached_categories (
        slug TEXT PRIMARY KEY NOT NULL,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS dismissed_events (
        event_id TEXT PRIMARY KEY NOT NULL,
        dismissed_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS preferences (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS reminders (
        event_id TEXT PRIMARY KEY NOT NULL,
        notification_id TEXT NOT NULL,
        scheduled_for TEXT NOT NULL,
        offset_minutes INTEGER NOT NULL
      );
    `);
    dbInstance = drizzle(sqlite, { schema });
  }
  return dbInstance;
}

export type Database = ExpoSQLiteDatabase<typeof schema>;
