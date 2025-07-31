import { type AnalyzeFoodImageOutput } from "@/ai/flows/analyze-food-image";

export type DisciplineMode = 'intense' | 'normal';

export type UserMetrics = {
  weight: number;
  bodyFat: number;
  height: number;
  maintenanceCalories: number;
  goalWeight?: number;
};

export type PhysiquePhotos = {
  front?: string; // base64 data URI
  back?: string;
  side?: string;
  flex?: string;
};

export interface Meal extends AnalyzeFoodImageOutput {
  id: string;
  timestamp: string;
  notes?: string;
  photoDataUri: string;
}

export type Set = {
  reps: number;
  weight: number;
  timestamp: string;
};

export type LastWeekSet = {
  id: string;
  userId: string;
  exerciseName: string;
  weekNumber: number;
  sets: Set[];
  createdAt: string;
  updatedAt: string;
};

export type PersonalBest = {
  id: string;
  userId: string;
  exerciseName: string;
  bestWeight: number;
  bestReps: number;
  achievedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Workout = {
  id: string;
  timestamp: string;
  category: string;
  exercises: {
    name:string;
    sets: { reps: number; weight: number }[];
  }[];
  notes?: string;
  sickButConsistent: boolean;
  mood: number;
  painLevel: number;
  mentalDiscipline: number;
};

export type AppState = {
  isInitialized: boolean;
  userId?: string;
  isOnboarded: boolean;
  disciplineMode: DisciplineMode;
  userMetrics: UserMetrics;
  onboardingPhotos: PhysiquePhotos;
  completionPhotos: PhysiquePhotos;
  workoutHistory: WorkoutHistory;
  meals: Meal[];
  startDate: string | null;
  
  // Actions
  setUserId: (userId: string) => void;
  _saveToFirestore: (data: Partial<AppState>) => void;
  completeOnboarding: (data: {
    metrics: UserMetrics;
    photos: PhysiquePhotos;
    mode: DisciplineMode;
  }) => void;
  logWorkout: (workout: Omit<Workout, 'id' | 'timestamp'>) => void;
  logMeal: (meal: Omit<Meal, 'id' | 'timestamp'>) => void;
  addCompletionPhotos: (photos: PhysiquePhotos) => void;
  resetProgress: () => void;
  saveLastWeekSets: (exerciseName: string, sets: Set[], weekNumber: number) => void;
  savePersonalBest: (exerciseName: string, weight: number, reps: number) => void;
  getLastWeekSets: (exerciseName: string, weekNumber: number) => Promise<LastWeekSet | null>;
  getPersonalBest: (exerciseName: string) => Promise<PersonalBest | null>;
};

// New types for revamped workout data structure
export type WorkoutDayType = 'chest_biceps' | 'back_triceps' | 'shoulders' | 'legs';

export type WeeklyWorkoutData = {
  weekNumber: number; // 1, 2, 3 (rotating)
  startDate: string;  // ISO date for the week
  exercises: {
    name: string;
    sets: { reps: number; weight: number; timestamp: string }[];
  }[];
};

export type WorkoutHistory = {
  [K in WorkoutDayType]: WeeklyWorkoutData[]; // Always max length 3 (circular buffer)
};
