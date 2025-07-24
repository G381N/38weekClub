const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, setDoc, doc } = require('firebase/firestore');
require('dotenv').config();

(async () => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);

  const userId = '1cgG4XVYB8RYxsoUfkGaoJr2mBe2';
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartDate = weekStart.toISOString().slice(0, 10);
  const workoutHistory = {
    chest_biceps: [{
      weekNumber: 1,
      startDate: weekStartDate,
      exercises: [
        { name: 'Flat Barbell Bench Press', sets: [ { reps: 12, weight: 50, timestamp: now.toISOString() }, { reps: 10, weight: 60, timestamp: now.toISOString() }, { reps: 8, weight: 70, timestamp: now.toISOString() }, { reps: 6, weight: 70, timestamp: now.toISOString() } ] },
        { name: 'Chest Press Machine', sets: [ { reps: 12, weight: 50, timestamp: now.toISOString() }, { reps: 10, weight: 60, timestamp: now.toISOString() }, { reps: 8, weight: 70, timestamp: now.toISOString() }, { reps: 6, weight: 70, timestamp: now.toISOString() } ] },
        { name: 'Incline Barbell Press', sets: [ { reps: 12, weight: 40, timestamp: now.toISOString() }, { reps: 10, weight: 45, timestamp: now.toISOString() }, { reps: 8, weight: 50, timestamp: now.toISOString() }, { reps: 6, weight: 50, timestamp: now.toISOString() } ] },
        { name: 'Chest Flies', sets: [ { reps: 15, weight: 30, timestamp: now.toISOString() }, { reps: 12, weight: 40, timestamp: now.toISOString() }, { reps: 10, weight: 50, timestamp: now.toISOString() }, { reps: 8, weight: 70, timestamp: now.toISOString() } ] },
        { name: 'Barbell Curls (Straight Bar)', sets: [ { reps: 15, weight: 20, timestamp: now.toISOString() }, { reps: 10, weight: 25, timestamp: now.toISOString() }, { reps: 10, weight: 30, timestamp: now.toISOString() }, { reps: 10, weight: 30, timestamp: now.toISOString() } ] },
        { name: 'Preacher Curls', sets: [ { reps: 15, weight: 10, timestamp: now.toISOString() } ] },
        { name: 'Hammer Curls', sets: [ { reps: 12, weight: 15, timestamp: now.toISOString() }, { reps: 10, weight: 15, timestamp: now.toISOString() }, { reps: 8, weight: 15, timestamp: now.toISOString() }, { reps: 6, weight: 15, timestamp: now.toISOString() } ] },
        { name: 'Incline Dumbbell Curls', sets: [ { reps: 12, weight: 15, timestamp: now.toISOString() }, { reps: 10, weight: 15, timestamp: now.toISOString() }, { reps: 8, weight: 15, timestamp: now.toISOString() }, { reps: 6, weight: 15, timestamp: now.toISOString() } ] },
        { name: 'Biceps-Focused Lat Pulldowns', sets: [ { reps: 12, weight: 25, timestamp: now.toISOString() } ] }
      ]
    }],
    back_triceps: [{
      weekNumber: 1,
      startDate: weekStartDate,
      exercises: [
        { name: 'Wide-Grip Lat Pulldown', sets: [ { reps: 12, weight: 60, timestamp: now.toISOString() }, { reps: 10, weight: 60, timestamp: now.toISOString() }, { reps: 8, weight: 60, timestamp: now.toISOString() }, { reps: 6, weight: 60, timestamp: now.toISOString() } ] },
        { name: 'Seated Rows', sets: [ { reps: 12, weight: 60, timestamp: now.toISOString() }, { reps: 10, weight: 60, timestamp: now.toISOString() }, { reps: 8, weight: 60, timestamp: now.toISOString() }, { reps: 6, weight: 60, timestamp: now.toISOString() } ] },
        { name: 'T-Bar Rows', sets: [ { reps: 12, weight: 50, timestamp: now.toISOString() }, { reps: 10, weight: 55, timestamp: now.toISOString() }, { reps: 8, weight: 60, timestamp: now.toISOString() }, { reps: 6, weight: 60, timestamp: now.toISOString() } ] },
        { name: 'Single-Arm Lat Cable Pullovers', sets: [ { reps: 12, weight: 25, timestamp: now.toISOString() } ] },
        { name: 'Tricep Pushdowns', sets: [ { reps: 12, weight: 40, timestamp: now.toISOString() }, { reps: 10, weight: 45, timestamp: now.toISOString() }, { reps: 8, weight: 50, timestamp: now.toISOString() }, { reps: 6, weight: 50, timestamp: now.toISOString() } ] },
        { name: 'Tricep Kickbacks', sets: [ { reps: 12, weight: 15, timestamp: now.toISOString() }, { reps: 10, weight: 15, timestamp: now.toISOString() }, { reps: 8, weight: 15, timestamp: now.toISOString() }, { reps: 6, weight: 15, timestamp: now.toISOString() } ] },
        { name: 'Skull Crushers (EZ Bar)', sets: [ { reps: 12, weight: 20, timestamp: now.toISOString() }, { reps: 10, weight: 25, timestamp: now.toISOString() }, { reps: 8, weight: 30, timestamp: now.toISOString() }, { reps: 6, weight: 30, timestamp: now.toISOString() } ] }
      ]
    }],
    shoulders: [{
      weekNumber: 1,
      startDate: weekStartDate,
      exercises: [
        { name: 'Shoulder Press (Traditional Grip)', sets: [ { reps: 12, weight: 30, timestamp: now.toISOString() }, { reps: 10, weight: 35, timestamp: now.toISOString() }, { reps: 8, weight: 40, timestamp: now.toISOString() }, { reps: 6, weight: 40, timestamp: now.toISOString() } ] },
        { name: 'Shoulder Press (Hammer Grip)', sets: [ { reps: 12, weight: 30, timestamp: now.toISOString() }, { reps: 10, weight: 35, timestamp: now.toISOString() }, { reps: 8, weight: 40, timestamp: now.toISOString() }, { reps: 6, weight: 40, timestamp: now.toISOString() } ] },
        { name: 'Lateral Raises', sets: [ { reps: 15, weight: 10, timestamp: now.toISOString() }, { reps: 12, weight: 12, timestamp: now.toISOString() }, { reps: 10, weight: 15, timestamp: now.toISOString() }, { reps: 8, weight: 15, timestamp: now.toISOString() } ] },
        { name: 'Rear Delt Machine / Raises', sets: [ { reps: 12, weight: 10, timestamp: now.toISOString() }, { reps: 10, weight: 12, timestamp: now.toISOString() }, { reps: 8, weight: 15, timestamp: now.toISOString() }, { reps: 6, weight: 15, timestamp: now.toISOString() } ] },
        { name: 'Shrugs', sets: [ { reps: 15, weight: 20, timestamp: now.toISOString() }, { reps: 12, weight: 25, timestamp: now.toISOString() }, { reps: 10, weight: 30, timestamp: now.toISOString() }, { reps: 8, weight: 30, timestamp: now.toISOString() } ] },
        { name: 'Face Pulls', sets: [ { reps: 15, weight: 10, timestamp: now.toISOString() }, { reps: 12, weight: 12, timestamp: now.toISOString() }, { reps: 10, weight: 15, timestamp: now.toISOString() }, { reps: 8, weight: 15, timestamp: now.toISOString() } ] }
      ]
    }],
    legs: [{
      weekNumber: 1,
      startDate: weekStartDate,
      exercises: [
        { name: 'Hamstring Curls', sets: [ { reps: 15, weight: 20, timestamp: now.toISOString() }, { reps: 12, weight: 25, timestamp: now.toISOString() }, { reps: 10, weight: 30, timestamp: now.toISOString() }, { reps: 8, weight: 30, timestamp: now.toISOString() } ] },
        { name: 'Leg Extensions', sets: [ { reps: 15, weight: 30, timestamp: now.toISOString() }, { reps: 12, weight: 40, timestamp: now.toISOString() }, { reps: 10, weight: 50, timestamp: now.toISOString() }, { reps: 8, weight: 60, timestamp: now.toISOString() } ] },
        { name: 'Leg Press', sets: [ { reps: 15, weight: 80, timestamp: now.toISOString() }, { reps: 12, weight: 100, timestamp: now.toISOString() }, { reps: 10, weight: 120, timestamp: now.toISOString() }, { reps: 8, weight: 140, timestamp: now.toISOString() } ] },
        { name: 'Standing Calf Raises', sets: [ { reps: 20, weight: 40, timestamp: now.toISOString() }, { reps: 18, weight: 45, timestamp: now.toISOString() }, { reps: 16, weight: 50, timestamp: now.toISOString() }, { reps: 14, weight: 55, timestamp: now.toISOString() } ] }
      ]
    }]
  };
  await setDoc(doc(db, 'users', userId), { workoutHistory }, { merge: true });
  console.log('Seeded workoutHistory for user', userId);
  process.exit(0);
})(); 