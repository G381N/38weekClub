export const exerciseFormTips: Record<string, {
  setup: string;
  execution: string;
  breathing: string;
  commonMistakes: string[];
}> = {
  "Flat Barbell Bench Press": {
    setup: "Lie flat on bench, feet firmly planted on floor. Grip bar slightly wider than shoulder-width. Retract shoulder blades and arch back slightly.",
    execution: "Lower bar to chest with control, pause briefly, then press explosively to start position. Keep elbows at 45° angle to body.",
    breathing: "Inhale during descent, hold breath at bottom, exhale forcefully during press.",
    commonMistakes: ["Bouncing bar off chest", "Lifting feet off floor", "Flaring elbows too wide", "Not retracting shoulder blades"]
  },
  "Chest Press Machine": {
    setup: "Adjust seat height so handles align with mid-chest. Sit back fully against pad, feet flat on floor.",
    execution: "Press handles forward in controlled motion, squeeze chest at peak contraction. Return slowly to start.",
    breathing: "Exhale during press, inhale during return phase.",
    commonMistakes: ["Using momentum", "Not sitting back fully", "Partial range of motion", "Pressing too high or low"]
  },
  "Incline Barbell Press": {
    setup: "Set bench to 30-45° incline. Grip bar slightly wider than shoulders. Plant feet firmly, maintain natural arch.",
    execution: "Lower bar to upper chest, press explosively while keeping core tight. Full range of motion essential.",
    breathing: "Deep breath before descent, exhale powerfully during press.",
    commonMistakes: ["Incline too steep", "Lowering to wrong chest position", "Not controlling the negative", "Using legs to assist"]
  },
  "Chest Flies": {
    setup: "Lie on bench with dumbbells, arms slightly bent. Start with weights above chest, palms facing each other.",
    execution: "Lower weights in wide arc until chest stretch is felt. Squeeze chest to return to start position.",
    breathing: "Inhale during stretch phase, exhale during contraction.",
    commonMistakes: ["Going too heavy", "Straightening arms completely", "Not controlling the stretch", "Using shoulders instead of chest"]
  },
  "Barbell Curls (Straight Bar)": {
    setup: "Stand upright, feet shoulder-width apart. Grip bar with underhand grip, arms fully extended.",
    execution: "Curl bar upward by contracting biceps, keep elbows stationary. Squeeze at top, lower with control.",
    breathing: "Exhale during curl, inhale during lowering phase.",
    commonMistakes: ["Swinging the body", "Moving elbows forward", "Not fully extending arms", "Using momentum"]
  },
  "Lat Pulldown": {
    setup: "Sit at machine, adjust thigh pad. Grip bar wider than shoulders with overhand grip. Lean back slightly.",
    execution: "Pull bar to upper chest by contracting lats. Squeeze shoulder blades together. Control the return.",
    breathing: "Exhale during pull, inhale during return.",
    commonMistakes: ["Pulling behind neck", "Using arms instead of back", "Not squeezing shoulder blades", "Leaning too far back"]
  },
  "Barbell Rows": {
    setup: "Stand with feet hip-width apart, bend at hips. Keep back straight, grip bar with overhand grip.",
    execution: "Pull bar to lower chest/upper abdomen. Squeeze shoulder blades together. Lower with control.",
    breathing: "Exhale during pull, inhale during lowering.",
    commonMistakes: ["Rounding the back", "Standing too upright", "Not squeezing shoulder blades", "Using momentum"]
  },
  "Close-Grip Bench Press": {
    setup: "Lie on bench, grip bar with hands about shoulder-width apart. Maintain slight arch in back.",
    execution: "Lower bar to chest keeping elbows close to body. Press up explosively, focusing on triceps.",
    breathing: "Inhale during descent, exhale during press.",
    commonMistakes: ["Grip too narrow", "Flaring elbows out", "Not going to chest", "Using chest instead of triceps"]
  },
  "Overhead Press": {
    setup: "Stand with feet shoulder-width apart. Grip bar at shoulder level, elbows under wrists.",
    execution: "Press bar straight overhead, keep core tight. Bar should travel in straight line over shoulders.",
    breathing: "Big breath at bottom, exhale at top.",
    commonMistakes: ["Pressing forward instead of up", "Not engaging core", "Excessive back arch", "Not fully extending overhead"]
  },
  "Lateral Raises": {
    setup: "Stand upright holding dumbbells at sides. Slight bend in elbows, palms facing down.",
    execution: "Raise weights out to sides until parallel to floor. Control the descent. Lead with pinkies.",
    breathing: "Exhale during raise, inhale during lowering.",
    commonMistakes: ["Going too heavy", "Raising above parallel", "Using momentum", "Not controlling the negative"]
  },
  "Squats": {
    setup: "Bar on upper traps, feet slightly wider than shoulders. Toes slightly pointed out.",
    execution: "Descend by pushing hips back and bending knees. Keep chest up, knees track over toes. Drive through heels.",
    breathing: "Big breath at top, hold during descent, exhale during ascent.",
    commonMistakes: ["Knees caving inward", "Not hitting depth", "Forward lean", "Rising hips first"]
  },
  "Romanian Deadlifts": {
    setup: "Hold bar with overhand grip, feet hip-width apart. Slight bend in knees throughout movement.",
    execution: "Push hips back while lowering bar along legs. Feel hamstring stretch, then drive hips forward to return.",
    breathing: "Inhale at top, exhale during hip drive.",
    commonMistakes: ["Bending knees too much", "Rounding the back", "Not pushing hips back", "Bar drifting away from body"]
  },
  "Leg Press Machine": {
    setup: "Sit in machine, feet on platform shoulder-width apart. Back flat against pad, core engaged.",
    execution: "Lower weight by bending knees to 90°. Press through heels to return to start position.",
    breathing: "Inhale during descent, exhale during press.",
    commonMistakes: ["Feet placement too high/low", "Not going to 90°", "Knees caving in", "Using partial range of motion"]
  },
  "Calf Raises": {
    setup: "Stand on balls of feet on platform edge. Hold weight or use machine for resistance.",
    execution: "Rise up on toes as high as possible, pause, then lower below platform level for stretch.",
    breathing: "Exhale during raise, inhale during stretch.",
    commonMistakes: ["Not getting full stretch", "Bouncing at bottom", "Not pausing at top", "Using momentum"]
  }
};

export const getExerciseTips = (exerciseName: string) => {
  return exerciseFormTips[exerciseName] || null;
}; 