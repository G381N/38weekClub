
export const motivationalQuotes = [
  { quote: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { quote: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { quote: "Everybody wants to be a beast, until it's time to do what real beasts do.", author: "Eric Thomas" },
  { quote: "Stay hard!", author: "David Goggins" },
  { quote: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { quote: "You don't have to be extreme, just consistent.", author: "Unknown" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { quote: "Light weight, baby!", author: "Ronnie Coleman" },
  { quote: "Yeah buddy!", author: "Ronnie Coleman" },
  { quote: "You don't know me, son!", author: "David Goggins" },
  { quote: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
  { quote: "The obsession to be the best is a sickness.", author: "Tom Platz" },
  { quote: "Suffer the pain of discipline or suffer the pain of regret.", author: "Jim Rohn" },
  { quote: "I'll be back.", author: "Arnold Schwarzenegger"},
  { quote: "The last three or four reps is what makes the muscle grow.", author: "Arnold Schwarzenegger"},
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
