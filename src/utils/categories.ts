import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

import type { CategorySlug } from '@/api/types';
import { getCategoryColor } from '@/theme/colors';

export { getCategoryColor };

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  academic_lecture: 'Academic',
  social_party: 'Social',
  free_food: 'Food',
  sports_athletics: 'Sports',
  arts_performance: 'Arts',
  career_professional: 'Career',
  club_org_meeting: 'Club',
  religious_spiritual: 'Religious',
  volunteer_community: 'Volunteer',
  health_wellness: 'Health',
};

export const CATEGORY_SHORT_LABELS: Record<CategorySlug, string> = {
  academic_lecture: 'Academic / Lecture',
  social_party: 'Social / Party',
  free_food: 'Free Food',
  sports_athletics: 'Sports / Athletics',
  arts_performance: 'Arts / Performance',
  career_professional: 'Career / Professional',
  club_org_meeting: 'Club / Org Meeting',
  religious_spiritual: 'Religious / Spiritual',
  volunteer_community: 'Volunteer / Community',
  health_wellness: 'Health / Wellness',
};

type IconName = ComponentProps<typeof MaterialIcons>['name'];

export const CATEGORY_ICONS: Record<CategorySlug, IconName> = {
  academic_lecture: 'school',
  social_party: 'groups',
  free_food: 'restaurant',
  sports_athletics: 'sports-basketball',
  arts_performance: 'theater-comedy',
  career_professional: 'work',
  club_org_meeting: 'group',
  religious_spiritual: 'church',
  volunteer_community: 'volunteer-activism',
  health_wellness: 'spa',
};

export function getCategoryIcon(slug: CategorySlug): IconName {
  return CATEGORY_ICONS[slug] ?? 'event';
}
