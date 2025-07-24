
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
  { id: 'day1', name: 'Day 1 - Chest & Biceps' },
  { id: 'day2', name: 'Day 2 - Back & Triceps & Forearms' },
  { id: 'day3', name: 'Day 3 - Shoulders' },
  { id: 'day4', name: 'Day 4 - Legs' },
] as const;

export type WorkoutCategoryId = typeof workoutCategories[number]['id'];

export const exercises: Record<WorkoutCategoryId, string[]> = {
  day1: [
    'Flat Barbell Bench Press',
    'Chest Press Machine',
    'Incline Barbell Press',
    'Chest Flies',
    'Barbell Curls (Straight Bar)',
    'Preacher Curls',
    'Hammer Curls',
    'Incline Dumbbell Curls',
    'Biceps-Focused Lat Pulldowns',
  ],
  day2: [
    'Wide-Grip Lat Pulldown',
    'Close-Grip Lat Pulldown',
    'Seated Rows',
    'T-Bar Rows',
    'Single-Arm Lat Cable Pullovers',
    'Tricep Pushdowns',
    'Tricep Kickbacks',
    'Skull Crushers (EZ Bar)',
    'Reverse Barbell Curls',
    'Wrist Curls',
    'Plate Pinches / Static Holds',
  ],
  day3: [
    'Shoulder Press (Traditional Grip)',
    'Shoulder Press (Hammer Grip)',
    'Lateral Raises',
    'Rear Delt Machine / Raises',
    'Shrugs',
    'Face Pulls',
  ],
  day4: [
    'Leg Extensions',
    'Leg Press',
    'Hamstring Curls',
    'Standing Calf Raises',
  ],
};
