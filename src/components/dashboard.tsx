
"use client";

import React, { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Flame, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { motivationalQuotes, workoutCategories } from '@/lib/data';
import { differenceInWeeks, startOfWeek, differenceInDays } from 'date-fns';

export function Dashboard() {
  const { disciplineMode, startDate, workouts } = useAppStore(state => ({
    disciplineMode: state.disciplineMode,
    startDate: state.startDate,
    workouts: state.workouts,
  }));

  const { weeksCompleted, disciplineStreak, workoutsThisWeek } = useMemo(() => {
    if (!startDate) return { weeksCompleted: 0, disciplineStreak: 0, workoutsThisWeek: new Set() };
    
    const start = new Date(startDate);
    const now = new Date();
    
    const weeksCompleted = differenceInWeeks(now, start);

    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });

    const recentWorkouts = workouts.filter(w => new Date(w.timestamp) >= currentWeekStart);
    const workoutsThisWeekSet = new Set(recentWorkouts.map(w => w.category));
    
    // NOTE: Discipline streak logic would be more complex, involving checking every past week.
    // For this demo, we'll equate it to weeks completed.
    const disciplineStreak = weeksCompleted;

    return { weeksCompleted, disciplineStreak, workoutsThisWeek: workoutsThisWeekSet };
  }, [startDate, workouts]);

  const dailyQuote = useMemo(() => motivationalQuotes[new Date().getDate() % motivationalQuotes.length], []);
  
  const getTodaysWorkoutCategory = () => {
    if (!startDate) return null;
    const dayIndex = differenceInDays(new Date(), new Date(startDate)) % 4; // Cycle through 4 workout days
    return workoutCategories[dayIndex];
  };

  const todaysCategory = getTodaysWorkoutCategory();

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
          <CardTitle>Today's Target: {todaysCategory ? todaysCategory.name : 'Rest Day'}</CardTitle>
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
