
"use client";

import React, { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { motivationalQuotes, workoutCategories } from '@/lib/data';
import { differenceInWeeks, startOfWeek } from 'date-fns';

export function Dashboard() {
  const { disciplineMode, startDate, workouts } = useAppStore(state => ({
    disciplineMode: state.disciplineMode,
    startDate: state.startDate,
    workouts: state.workouts,
  }));

  const {
    weeksCompleted,
    disciplineStreak,
    workoutsThisWeek,
    nextWorkoutCategory,
  } = useMemo(() => {
    if (!startDate) {
      return {
        weeksCompleted: 0,
        disciplineStreak: 0,
        workoutsThisWeek: new Set(),
        nextWorkoutCategory: workoutCategories[0],
      };
    }

    const start = new Date(startDate);
    const now = new Date();

    const weeksCompleted = differenceInWeeks(now, start);

    // Calculate streak based on full 4-workout weeks completed
    const disciplineStreak = Math.floor(workouts.length / 4);

    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const recentWorkouts = workouts.filter(w => new Date(w.timestamp) >= currentWeekStart);
    const workoutsThisWeekSet = new Set(recentWorkouts.map(w => w.category));

    // Determine the next workout based on completion history
    const totalWorkoutsCompleted = workouts.length;
    const nextWorkoutIndex = totalWorkoutsCompleted % workoutCategories.length;
    const nextWorkoutCategory = workoutCategories[nextWorkoutIndex];

    return {
      weeksCompleted,
      disciplineStreak,
      workoutsThisWeek: workoutsThisWeekSet,
      nextWorkoutCategory,
    };
  }, [startDate, workouts]);

  const dailyQuote = useMemo(() => motivationalQuotes[new Date().getDate() % motivationalQuotes.length], []);

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 duration-500">
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">Discipline Streak</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-4xl font-bold text-foreground">{disciplineStreak} <span className="text-xl text-muted-foreground">Weeks</span></p>
            <p className="text-sm text-muted-foreground">You are {weeksCompleted} of 38 weeks in.</p>
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
          <CardTitle>Today's Target: {nextWorkoutCategory.name}</CardTitle>
          <CardDescription>Focus. Execute. Overcome.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {workoutCategories.map(cat => (
            <div key={cat.id} className="flex justify-between items-center p-3 rounded-md bg-secondary/50">
              <span className="font-medium">{cat.name}</span>
              {workoutsThisWeek.has(cat.id) ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card border-border italic">
        <CardContent className="p-4">
          <p className="text-center text-muted-foreground">"{dailyQuote}"</p>
        </CardContent>
      </Card>
    </div>
  );
}
