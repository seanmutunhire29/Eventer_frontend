import type { CategorySlug } from '@/api/types';
import { getCategoryColor } from '@/theme/colors';

/**
 * A single, consistent monochrome icon set for the map badges, rendered inside
 * the Leaflet WebView. Each value is a "Material Symbols Outlined" ligature
 * (loaded as a webfont in the WebView) so the whole set shares one visual
 * style; badges tint the glyph with the category accent color.
 */
export const CATEGORY_GLYPH: Record<CategorySlug, string> = {
  academic_lecture: 'school',
  social_party: 'local_bar',
  free_food: 'restaurant',
  sports_athletics: 'directions_run',
  arts_performance: 'palette',
  career_professional: 'work',
  club_org_meeting: 'groups',
  religious_spiritual: 'church',
  volunteer_community: 'volunteer_activism',
  health_wellness: 'spa',
};

export function getCategoryGlyph(slug: CategorySlug): string {
  return CATEGORY_GLYPH[slug] ?? 'event';
}

export { getCategoryColor };
