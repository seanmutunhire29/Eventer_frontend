export type CategorySlug =
  | 'academic_lecture'
  | 'social_party'
  | 'free_food'
  | 'sports_athletics'
  | 'arts_performance'
  | 'career_professional'
  | 'club_org_meeting'
  | 'religious_spiritual'
  | 'volunteer_community'
  | 'health_wellness';

export type BuildingAliasSource = 'scraper' | 'admin' | 'student_report';

export interface BuildingAlias {
  id: number;
  alias: string;
  source: BuildingAliasSource;
}

export interface Building {
  id: number;
  official_name: string;
  lat: number;
  lng: number;
  geojson_id: string;
  aliases: BuildingAlias[];
}

export interface EventOtherInfo {
  has_food?: boolean;
  needs_registration?: boolean;
  needs_invite?: boolean;
  guests_allowed?: boolean;
  contact_email?: string;
  [key: string]: unknown;
}

export interface Event {
  id: string;
  event_name: string;
  building: Building | null;
  unresolved_location: string | null;
  start_time: string;
  end_time: string;
  description: string;
  category: CategorySlug;
  other_info: EventOtherInfo;
  source_url: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface Category {
  slug: CategorySlug;
  label: string;
  accent_color: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type ReminderOffset = 5 | 10 | 15 | 30 | 60 | null;

export interface UserPreferences {
  theme: ThemeMode;
  pushNotifications: boolean;
  defaultReminderMinutes: ReminderOffset;
  enabledCategories: CategorySlug[];
}

export const ALL_CATEGORY_SLUGS: CategorySlug[] = [
  'academic_lecture',
  'social_party',
  'free_food',
  'sports_athletics',
  'arts_performance',
  'career_professional',
  'club_org_meeting',
  'religious_spiritual',
  'volunteer_community',
  'health_wellness',
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  pushNotifications: true,
  defaultReminderMinutes: 10,
  enabledCategories: [...ALL_CATEGORY_SLUGS],
};
