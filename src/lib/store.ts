"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from './firebase';
import { type AppState, type DisciplineMode, type UserMetrics, type PhysiquePhotos, type Workout, type Meal } from './types';

const initialState = {
  isInitialized: false,
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
      setUserId: async (userId) => {
        if (get().userId === userId && get().isInitialized) return;

        set({ userId, isInitialized: false });

        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          set({ ...data as any, isInitialized: true });
        } else {
          set({ ...initialState, isInitialized: true });
        }
      },
      _saveToFirestore: (data) => {
        const userId = get().userId;
        if (!userId) return;
        const docRef = doc(db, "users", userId);
        setDoc(docRef, data, { merge: true });
      },
      completeOnboarding: ({ metrics, photos, mode }) => {
        const newState = {
          isOnboarded: true,
          userMetrics: metrics,
          onboardingPhotos: photos,
          disciplineMode: mode,
          startDate: new Date().toISOString(),
        };
        set(newState);
        get()._saveToFirestore(newState);
      },
      logWorkout: (workout) => {
        const newWorkout: Workout = {
            ...workout,
            id: new Date().getTime().toString(),
            timestamp: new Date().toISOString()
        };
        set((state) => {
          const workouts = [...state.workouts, newWorkout];
          get()._saveToFirestore({ workouts });
          return { workouts };
        });
      },
      logMeal: (meal) => {
        const newMeal: Meal = {
            ...meal,
            id: new Date().getTime().toString(),
            timestamp: new Date().toISOString()
        };
        set((state) => {
          const meals = [newMeal, ...state.meals];
          get()._saveToFirestore({ meals });
          return { meals };
        });
      },
      addCompletionPhotos: (photos) => {
        set({ completionPhotos: photos });
        get()._saveToFirestore({ completionPhotos: photos });
      },
      resetProgress: () => {
         const newState = { 
            ...initialState, 
            isOnboarded: true, 
            userMetrics: get().userMetrics, 
            disciplineMode: get().disciplineMode 
         };
         set(newState);
         get()._saveToFirestore(newState);
      },
    }),
    {
      name: '38-club-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-user-specific data or data that is okay to be cached.
      // Firestore is the source of truth for user data.
      partialize: (state) => ({
        // We don't persist userId to avoid issues with mismatched users on the same device.
      }),
    }
  )
);
