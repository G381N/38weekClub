
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { workoutCategories } from '@/lib/data';
import { differenceInWeeks, startOfWeek } from 'date-fns';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WorkoutHistory, WeeklyWorkoutData } from '@/lib/types';

export function Dashboard() {
  const { disciplineMode, startDate, workoutHistory, userId } = useAppStore(state => ({
    disciplineMode: state.disciplineMode,
    startDate: state.startDate,
    workoutHistory: state.workoutHistory,
    userId: state.userId,
  }));
  const [disciplineStreak, setDisciplineStreak] = useState(0);
  useEffect(() => {
    async function fetchStreak() {
      if (!userId) return;
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().disciplineStreak) {
        setDisciplineStreak(userSnap.data().disciplineStreak);
      } else {
        setDisciplineStreak(0);
      }
    }
    fetchStreak();
  }, [userId]);

  // Utility to flatten workoutHistory into a flat array
  const flattenWorkouts = (workoutHistory: WorkoutHistory): Array<{ dayType: string; week: number; startDate: string; exercises: { name: string; sets: { reps: number; weight: number; timestamp: string }[] }[] }> => {
    const all: Array<{ dayType: string; week: number; startDate: string; exercises: { name: string; sets: { reps: number; weight: number; timestamp: string }[] }[] }> = [];
    Object.entries(workoutHistory).forEach(([dayType, weeks]) => {
      weeks.forEach((week: WeeklyWorkoutData) => {
        all.push({
          dayType,
          week: week.weekNumber,
          startDate: week.startDate,
          exercises: week.exercises,
        });
      });
    });
    return all;
  };

  const workouts = useMemo(() => flattenWorkouts(workoutHistory), [workoutHistory]);

  const {
    weeksCompleted,
    workoutsThisWeek,
    nextWorkoutCategory,
  } = useMemo(() => {
    if (!startDate) {
      return {
        weeksCompleted: 0,
        workoutsThisWeek: new Set(),
        nextWorkoutCategory: workoutCategories[0],
      };
    }

    const start = new Date(startDate);
    const now = new Date();

    const weeksCompleted = differenceInWeeks(now, start);

    // Calculate streak based on full 4-workout weeks completed
    const disciplineStreak = Math.floor(workouts.length / 4);

    // Find workouts in the current week
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const recentWorkouts = workouts.filter(w => new Date(w.startDate) >= currentWeekStart);
    // For each workout, try to map to a category id
    const workoutsThisWeekSet = new Set(recentWorkouts.map(w => {
      // Map dayType to category id
      switch (w.dayType) {
        case 'chest_biceps': return 'day1';
        case 'back_triceps': return 'day2';
        case 'shoulders': return 'day3';
        case 'legs': return 'day4';
        default: return '';
      }
    }));

    // Determine the next workout based on completion history
    const totalWorkoutsCompleted = workouts.length;
    const nextWorkoutIndex = totalWorkoutsCompleted % workoutCategories.length;
    const nextWorkoutCategory = workoutCategories[nextWorkoutIndex];

    return {
      weeksCompleted,
      workoutsThisWeek: workoutsThisWeekSet,
      nextWorkoutCategory,
    };
  }, [startDate, workouts]);

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 duration-500">
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">Discipline Streak</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-4xl font-bold text-foreground">{disciplineStreak} <span className="text-xl text-muted-foreground">Weeks</span></p>
            <p className="text-sm text-muted-foreground">You are {disciplineStreak} of 38 weeks in.</p>
        </CardContent>
      </Card>

      {disciplineMode === 'intense' && (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="p-4 flex items-center gap-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
            <div>
              <h3 className="font-bold text-destructive-foreground">Intense Mode Active</h3>
              <p className="text-sm text-destructive-foreground/80">Missing a scheduled workout will have consequences.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Target: {nextWorkoutCategory.name}</CardTitle>
          <CardDescription>Focus. Execute. Overcome.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-col gap-2">
            {workoutCategories.map(cat => {
              const isCompleted = workoutsThisWeek.has(cat.id);
              const isToday = nextWorkoutCategory.id === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-3 rounded-md transition-all ${isToday ? 'bg-accent/80 text-black shadow-lg scale-105' : isCompleted ? 'bg-green-100 text-green-800' : 'bg-secondary/50 text-foreground/80'}`}
                >
                  <span className="font-medium flex items-center gap-2">
                    {isToday && <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />}
                    {cat.name}
                  </span>
                  {isCompleted ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-500 text-white font-bold">Done</span>
                  ) : isToday ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-accent text-black font-bold border border-accent-foreground">Today</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">Upcoming</span>
              )}
            </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
