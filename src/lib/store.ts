"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from './firebase';
import { type AppState, type DisciplineMode, type UserMetrics, type PhysiquePhotos, type Workout, type Meal, type Set, type LastWeekSet, type PersonalBest, type WorkoutHistory } from './types';

const initialState = {
  isInitialized: false,
  isOnboarded: false,
  disciplineMode: 'normal' as DisciplineMode,
  userMetrics: { weight: 70, bodyFat: 15, height: 175, maintenanceCalories: 2500 },
  onboardingPhotos: {},
  completionPhotos: {},
  workoutHistory: {
    chest_biceps: [],
    back_triceps: [],
    shoulders: [],
    legs: [],
  } as WorkoutHistory,
  meals: [],
  startDate: null,
  saveLastWeekSets: async () => {},
  savePersonalBest: async () => {},
  getLastWeekSets: async () => null,
  getPersonalBest: async () => null,
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
          set({ ...(data as Partial<AppState>), isInitialized: true });
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
        // Determine the workout day type from the category
        // Map old category strings to new WorkoutDayType
        const categoryMap: Record<string, keyof WorkoutHistory> = {
          'day1': 'chest_biceps',
          'day2': 'back_triceps',
          'day3': 'shoulders',
          'day4': 'legs',
          'chest_biceps': 'chest_biceps',
          'back_triceps': 'back_triceps',
          'shoulders': 'shoulders',
          'legs': 'legs',
        };
        const dayType = categoryMap[workout.category] || 'chest_biceps';
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Sunday as start of week
        const weekStartDate = weekStart.toISOString().slice(0, 10);

        set((state) => {
          const prevWeeks = state.workoutHistory[dayType] || [];
          // Check if current week already exists
          const weekIdx = prevWeeks.findIndex(w => w.startDate === weekStartDate);
          let newWeeks = [...prevWeeks];
          if (weekIdx === -1) {
            // New week, add to front, remove oldest if >3
            newWeeks = [
              {
                weekNumber: prevWeeks.length === 0 ? 1 : ((prevWeeks[0].weekNumber % 3) + 1),
                startDate: weekStartDate,
                exercises: workout.exercises.map(e => ({
                  name: e.name,
                  sets: e.sets.map(s => ({ ...s, timestamp: new Date().toISOString() })),
                })),
              },
              ...prevWeeks,
            ].slice(0, 3);
          } else {
            // Update existing week (merge exercises)
            const week = { ...newWeeks[weekIdx] };
            workout.exercises.forEach(ex => {
              const exIdx = week.exercises.findIndex(e => e.name === ex.name);
              if (exIdx === -1) {
                week.exercises.push({
                  name: ex.name,
                  sets: ex.sets.map(s => ({ ...s, timestamp: new Date().toISOString() })),
                });
              } else {
                week.exercises[exIdx].sets.push(...ex.sets.map(s => ({ ...s, timestamp: new Date().toISOString() })));
              }
            });
            newWeeks[weekIdx] = week;
          }
          const workoutHistory = { ...state.workoutHistory, [dayType]: newWeeks };
          get()._saveToFirestore({ workoutHistory });
          return { workoutHistory };
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
      saveLastWeekSets: async (exerciseName: string, sets: Set[], weekNumber: number) => {
        const userId = get().userId;
        if (!userId) return;

        // First, check if there's an existing record for this exercise and week
        const lastWeekSetsRef = collection(db, "lastWeekSets");
        const q = query(
          lastWeekSetsRef,
          where("userId", "==", userId),
          where("exerciseName", "==", exerciseName),
          where("weekNumber", "==", weekNumber)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Update existing record
          const docRef = doc(db, "lastWeekSets", querySnapshot.docs[0].id);
          await setDoc(docRef, {
            sets,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } else {
          // Create new record
          const newLastWeekSet: LastWeekSet = {
            id: `${userId}_${exerciseName}_${weekNumber}`,
            userId,
            exerciseName,
            weekNumber,
            sets,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const docRef = doc(db, "lastWeekSets", newLastWeekSet.id);
          await setDoc(docRef, newLastWeekSet);
        }
      },
      savePersonalBest: async (exerciseName: string, weight: number, reps: number) => {
        const userId = get().userId;
        if (!userId) return;

        // Check if there's an existing personal best for this exercise
        const personalBestsRef = collection(db, "personalBests");
        const q = query(
          personalBestsRef,
          where("userId", "==", userId),
          where("exerciseName", "==", exerciseName)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const existingBest = querySnapshot.docs[0].data() as PersonalBest;
          
          // Only update if the new weight is higher, or same weight but more reps
          if (weight > existingBest.bestWeight || 
              (weight === existingBest.bestWeight && reps > existingBest.bestReps)) {
            const docRef = doc(db, "personalBests", querySnapshot.docs[0].id);
            await setDoc(docRef, {
              bestWeight: weight,
              bestReps: reps,
              achievedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        } else {
          // Create new personal best
          const newPersonalBest: PersonalBest = {
            id: `${userId}_${exerciseName}`,
            userId,
            exerciseName,
            bestWeight: weight,
            bestReps: reps,
            achievedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const docRef = doc(db, "personalBests", newPersonalBest.id);
          await setDoc(docRef, newPersonalBest);
        }
      },
      getLastWeekSets: async (exerciseName: string, weekNumber: number): Promise<LastWeekSet | null> => {
        const userId = get().userId;
        if (!userId) return null;

        const lastWeekSetsRef = collection(db, "lastWeekSets");
        const q = query(
          lastWeekSetsRef,
          where("userId", "==", userId),
          where("exerciseName", "==", exerciseName),
          where("weekNumber", "==", weekNumber)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data() as LastWeekSet;
        }
        
        return null;
      },
      getPersonalBest: async (exerciseName: string): Promise<PersonalBest | null> => {
        const userId = get().userId;
        if (!userId) return null;

        const personalBestsRef = collection(db, "personalBests");
        const q = query(
          personalBestsRef,
          where("userId", "==", userId),
          where("exerciseName", "==", exerciseName)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          return querySnapshot.docs[0].data() as PersonalBest;
        }
        
        return null;
      },
      deleteOldMeals: async () => {
        const userId = get().userId;
        if (!userId) return;
        const today = new Date().toISOString().slice(0, 10);
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        if (!data.meals) return;
        const filteredMeals = data.meals.filter((meal: { timestamp?: string }) => meal.timestamp && meal.timestamp.slice(0, 10) === today);
        await setDoc(docRef, { meals: filteredMeals }, { merge: true });
      },
    }),
    {
      name: '38-club-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-user-specific data or data that is okay to be cached.
      // Firestore is the source of truth for user data.
      partialize: (state) => ({
        // We don't persist userId to avoid issues with mismatched users on the same device.
      })
    }
  )
);
