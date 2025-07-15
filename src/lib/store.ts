"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type AppState, type DisciplineMode, type UserMetrics, type PhysiquePhotos, type Workout, type Meal } from './types';

const initialState = {
  isOnboarded: false,
  disciplineMode: 'normal' as DisciplineMode,
  userMetrics: { weight: 70, bodyFat: 15, height: 175, maintenanceCalories: 2500 },
  onboardingPhotos: {},
  completionPhotos: {},
  workouts: [],
  meals: [],
  startDate: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      completeOnboarding: ({ metrics, photos, mode }) =>
        set({
          isOnboarded: true,
          userMetrics: metrics,
          onboardingPhotos: photos,
          disciplineMode: mode,
          startDate: new Date().toISOString(),
        }),
      logWorkout: (workout) => {
        const newWorkout: Workout = {
            ...workout,
            id: new Date().getTime().toString(),
            timestamp: new Date().toISOString()
        };
        set((state) => ({ workouts: [...state.workouts, newWorkout] }));
      },
      logMeal: (meal) => {
        const newMeal: Meal = {
            ...meal,
            id: new Date().getTime().toString(),
            timestamp: new Date().toISOString()
        };
        set((state) => ({ meals: [newMeal, ...state.meals]}));
      },
      addCompletionPhotos: (photos) => set({ completionPhotos: photos }),
      resetProgress: () => set({ ...initialState, isOnboarded: true, userMetrics: get().userMetrics, disciplineMode: get().disciplineMode }),
    }),
    {
      name: '38-club-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
