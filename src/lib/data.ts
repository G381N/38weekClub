export const motivationalQuotes = [
  "The only person you are destined to become is the person you decide to be.",
  "Discipline is the bridge between goals and accomplishment.",
  "Everybody wants to be a beast, until it's time to do what real beasts do.",
  "Stay hard!",
  "The pain you feel today will be the strength you feel tomorrow.",
  "You don't have to be extreme, just consistent.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Light weight, baby!",
  "Yeah buddy, light weight!",
];

export const workoutCategories = [
  { id: 'chest_biceps', name: 'Chest & Biceps' },
  { id: 'back_triceps', name: 'Back & Triceps' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'legs', name: 'Legs' },
] as const;

export type WorkoutCategoryId = typeof workoutCategories[number]['id'];

export const exercises: Record<WorkoutCategoryId, string[]> = {
  chest_biceps: [
    'Incline Dumbbell Press',
    'Flat Barbell Bench Press',
    'Decline Machine Press',
    'Cable Crossovers',
    'Barbell Curls',
    'Dumbbell Hammer Curls',
    'Preacher Curls',
  ],
  back_triceps: [
    'Pull-ups',
    'Bent-over Rows',
    'Lat Pulldowns',
    'T-bar Rows',
    'Close-grip Bench Press',
    'Tricep Pushdowns',
    'Skull Crushers',
  ],
  shoulders: [
    'Overhead Press',
    'Dumbbell Lateral Raises',
    'Face Pulls',
    'Arnold Press',
    'Upright Rows',
  ],
  legs: [
    'Barbell Squats',
    'Leg Press',
    'Romanian Deadlifts',
    'Leg Extensions',
    'Hamstring Curls',
    'Calf Raises',
  ],
};
