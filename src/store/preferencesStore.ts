import { create } from 'zustand';

import type { UserPreferences } from '@/api/types';
import { DEFAULT_PREFERENCES } from '@/api/types';

interface PreferencesState {
  preferences: UserPreferences;
  hydrated: boolean;
  setPreferences: (prefs: UserPreferences) => void;
  setHydrated: (value: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: DEFAULT_PREFERENCES,
  hydrated: false,
  setPreferences: (preferences) => set({ preferences }),
  setHydrated: (hydrated) => set({ hydrated }),
}));
