import { type AnalyzeFoodImageOutput } from "@/ai/flows/analyze-food-image";

export type DisciplineMode = 'intense' | 'normal';

export type UserMetrics = {
  weight: number;
  bodyFat: number;
  height: number;
  maintenanceCalories: number;
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
  workouts: Workout[];
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
};
