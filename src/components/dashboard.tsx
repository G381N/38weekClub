"use client";

import React, { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Flame, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { motivationalQuotes, workoutCategories } from '@/lib/data';
import { differenceInWeeks, startOfWeek } from 'date-fns';

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

  const progress = Math.min((weeksCompleted / 38) * 100, 100);
  const dailyQuote = useMemo(() => motivationalQuotes[new Date().getDate() % motivationalQuotes.length], []);

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 duration-500">
      <Card className="bg-gradient-to-br from-card to-secondary/50 border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-accent">38 Week Transformation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: progress }, { value: 100 - progress }]}
                  dataKey="value"
                  innerRadius="70%"
                  outerRadius="90%"
                  startAngle={90}
                  endAngle={450}
                  cornerRadius={5}
                  paddingAngle={progress > 0 && progress < 100 ? 2 : 0}
                >
                  <Cell fill="hsl(var(--primary))" className="stroke-primary" />
                  <Cell fill="hsl(var(--muted))" className="stroke-muted" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-foreground">{weeksCompleted}</span>
              <span className="text-muted-foreground">of 38 Weeks</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {disciplineMode === 'intense' && (
        <Card className="bg-destructive/10 border-destructive">
          <CardContent className="p-4 flex items-center gap-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
            <div>
              <h3 className="font-bold text-destructive-foreground">Intense Mode Active</h3>
              <p className="text-sm text-destructive-foreground/80">Missing 4 workouts this week will reset all progress.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>This Week's Split</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {workoutCategories.map(cat => (
            <div key={cat.id} className="flex justify-between items-center p-2 rounded-md bg-secondary/50">
              <span>{cat.name}</span>
              {workoutsThisWeek.has(cat.id) ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <XCircle className="text-muted-foreground" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame /> Discipline Streak</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold text-accent">{disciplineStreak} <span className="text-lg text-muted-foreground">Weeks</span></p>
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
