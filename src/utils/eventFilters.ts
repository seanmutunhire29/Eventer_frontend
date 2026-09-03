import type { CategorySlug, Event } from '@/api/types';
import { isSameLocalDay } from '@/utils/dates';

export interface EventFilterOptions {
  dismissedIds: string[];
  enabledCategories: CategorySlug[];
  selectedCategories: CategorySlug[];
  selectedDay: string;
  search: string;
}

export function filterEvents(events: Event[], options: EventFilterOptions): Event[] {
  const { dismissedIds, enabledCategories, selectedCategories, selectedDay, search } = options;
  const query = search.trim().toLowerCase();

  return events.filter((event) => {
    if (dismissedIds.includes(event.id)) return false;
    if (!enabledCategories.includes(event.category)) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(event.category)) {
      return false;
    }
    if (selectedDay && !isSameLocalDay(event.start_time, selectedDay)) return false;
    if (!query) return true;

    const buildingName = event.building?.official_name?.toLowerCase() ?? '';
    const aliases = event.building?.aliases.map((a) => a.alias.toLowerCase()).join(' ') ?? '';
    return (
      event.event_name.toLowerCase().includes(query) ||
      buildingName.includes(query) ||
      aliases.includes(query) ||
      (event.unresolved_location?.toLowerCase().includes(query) ?? false)
    );
  });
}

export function getEventLocationLabel(event: Event): string {
  return event.building?.official_name ?? event.unresolved_location ?? 'Location TBD';
}
