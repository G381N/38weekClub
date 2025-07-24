
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { workoutCategories, exercises, type WorkoutCategoryId } from '@/lib/data';
import { BrainCircuit, HeartPulse, Shield, Plus, CheckCircle, Flame, Dumbbell, Repeat, History, Award, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isToday, parseISO, subDays, differenceInWeeks } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { type Set, type LastWeekSet, type PersonalBest } from '@/lib/types';
import { WheelPicker } from './ui/wheel-picker';
import { db } from '@/lib/firebase';
import { setDoc, doc, getDoc, updateDoc, collection, query, getDocs, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/auth';

type ExerciseLog = { name: string; sets: Set[] };
type PerformanceStats = {
    personalBest: PersonalBest | null;
    lastWeekSets: LastWeekSet | null;
};

// --- DIALOGS ---

const StatsModal = ({
    isOpen,
    onOpenChange,
    exerciseName,
    stats
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    exerciseName: string;
    stats: PerformanceStats;
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        {exerciseName} - Performance Stats
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* Personal Best Section */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-500" />
                            Personal Best
                        </h3>
                        {stats.personalBest ? (
                            <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-500/30">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-yellow-600">
                                        {stats.personalBest.weight} kg
                                    </p>
                                    <p className="text-lg text-muted-foreground">
                                        × {stats.personalBest.reps} reps
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Achieved: {new Date(stats.personalBest.achievedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-muted-foreground">No personal best recorded yet</p>
                            </div>
                        )}
                    </div>

                    {/* Last Week Sets Section */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-500" />
                            Last Week's Sets
                        </h3>
                        {stats.lastWeekSets && stats.lastWeekSets.sets.length > 0 ? (
                            <div className="space-y-2">
                                {stats.lastWeekSets.sets.map((set, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                                        <span className="font-semibold">Set {index + 1}</span>
                                        <span className="font-mono">
                                            {set.weight} kg × {set.reps} reps
                                        </span>
                                    </div>
                                ))}
                                <p className="text-xs text-muted-foreground text-center">
                                    Week {stats.lastWeekSets.weekNumber}
                                </p>
                            </div>
                        ) : stats.personalBest && stats.personalBest.achievedAt && differenceInWeeks(new Date(), parseISO(stats.personalBest.achievedAt)) < 1 ? (
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="font-bold text-lg text-yellow-600">{stats.personalBest.weight} kg</p>
                                <p className="text-lg text-muted-foreground">× {stats.personalBest.reps} reps</p>
                                <p className="text-xs text-muted-foreground mt-2">Achieved: {stats.personalBest.achievedAt}</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-muted-foreground">No sets recorded last week</p>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const motivationalQuotes = [
  "Consistency is key. Log every rep!",
  "Every set counts toward progress.",
  "Push your limits, then log them.",
  "Small steps, big results.",
  "Discipline is doing it even when you don't feel like it."
];

const SetLoggerDialog = ({
    isOpen,
    onOpenChange,
    onSave,
    stats,
    onStartTimer
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (set: Set) => void;
    stats: PerformanceStats;
    onStartTimer: () => void;
}) => {
    const [set, setSet] = useState<Set>({ reps: 8, weight: 20, timestamp: new Date().toISOString() });
    const [quoteIdx, setQuoteIdx] = useState(0);

    useEffect(() => {
      if (isOpen) {
        setQuoteIdx(Math.floor(Math.random() * motivationalQuotes.length));
      }
    }, [isOpen]);

    const handleSave = () => {
        onSave(set);
        onOpenChange(false);
        onStartTimer();
    }

    // Picker options
    const weightOptions = Array.from({length: 121}, (_, i) => i * 2.5); // 0 to 300kg
    const repsOptions = Array.from({length: 30}, (_, i) => i + 1); // 1 to 30

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xs p-6 rounded-xl bg-background flex flex-col items-center justify-center">
                <DialogHeader>
                  <DialogTitle>What is the heaviest weight you lifted?</DialogTitle>
                  <DialogDescription>Push your limits, then log them.</DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center gap-6 my-4 w-full">
                  <div className="flex flex-col items-center">
                    <WheelPicker
                      value={set.weight}
                      onChange={val => setSet(s => ({ ...s, weight: val }))}
                      options={weightOptions}
                      itemHeight={40}
                      className=""
                    />
                    <span className="text-base font-semibold text-muted-foreground mt-1">kg</span>
                  </div>
                  <span className="text-3xl font-bold text-muted-foreground mx-2">×</span>
                  <div className="flex flex-col items-center">
                    <WheelPicker
                      value={set.reps}
                      onChange={val => setSet(s => ({ ...s, reps: val }))}
                      options={repsOptions}
                      itemHeight={40}
                      className=""
                    />
                    <span className="text-base font-semibold text-muted-foreground mt-1">reps</span>
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full text-lg py-4 mt-4 forged-button rounded-lg">Log Set & Start Timer</Button>
            </DialogContent>
        </Dialog>
    );
};

const MetricsModal = ({ onSave, onOpenChange, open }: { onSave: (details: any) => void; onOpenChange: (open: boolean) => void; open: boolean }) => {
    const [sickButConsistent, setSickButConsistent] = useState(false);
    const [beastState, setBeastState] = useState({ mood: 5, painLevel: 1, mentalDiscipline: 5 });
    const [notes, setNotes] = useState("");

    const handleSave = () => {
        onSave({ sickButConsistent, ...beastState, notes });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Finalize Session</DialogTitle>
                    <DialogDescription>Log the details of your mental and physical state.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between p-3 rounded-md bg-secondary/30">
                        <Label htmlFor="sick-mode" className="flex flex-col gap-1.5 cursor-pointer">
                            <span>Sick But Consistent</span>
                            <span className="font-normal text-xs text-muted-foreground">For training under stress or illness.</span>
                        </Label>
                        <Switch id="sick-mode" checked={sickButConsistent} onCheckedChange={setSickButConsistent} />
                    </div>
                    <Textarea placeholder="Optional notes on your session..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                    
                    <div className="space-y-6">
                        <h4 className="font-semibold text-center">Beast-State Metrics</h4>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><HeartPulse /> Mood: {beastState.mood}/10</Label>
                            <Slider value={[beastState.mood]} onValueChange={([val]) => setBeastState(s => ({ ...s, mood: val }))} min={1} max={10} step={1} />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Shield /> Pain Level (Good Pain): {beastState.painLevel}/10</Label>
                            <Slider value={[beastState.painLevel]} onValueChange={([val]) => setBeastState(s => ({ ...s, painLevel: val }))} min={1} max={10} step={1} />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><BrainCircuit /> Mental Discipline: {beastState.mentalDiscipline}/10</Label>
                            <Slider value={[beastState.mentalDiscipline]} onValueChange={([val]) => setBeastState(s => ({ ...s, mentalDiscipline: val }))} min={1} max={10} step={1} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} className="w-full text-lg forged-button">Forge Session</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --- MAIN COMPONENT ---
export function WorkoutTracker({ onStartTimer }: { onStartTimer: () => void }) {
  const { toast } = useToast();
  const { 
    logWorkout, 
    startDate, 
    disciplineMode, 
    workoutHistory,
    saveLastWeekSets,
    savePersonalBest,
    getLastWeekSets,
    getPersonalBest
  } = useAppStore(state => ({
    logWorkout: state.logWorkout,
    startDate: state.startDate,
    disciplineMode: state.disciplineMode,
    workoutHistory: state.workoutHistory,
    saveLastWeekSets: state.saveLastWeekSets,
    savePersonalBest: state.savePersonalBest,
    getLastWeekSets: state.getLastWeekSets,
    getPersonalBest: state.getPersonalBest
  }));

  const { user } = useAuth();

  // Utility to flatten workoutHistory into a flat array
  const flattenWorkouts = (workoutHistory: any): Array<{ dayType: string; week: number; startDate: string; exercises: any[] }> => {
    const all: Array<{ dayType: string; week: number; startDate: string; exercises: any[] }> = [];
    Object.entries(workoutHistory).forEach(([dayType, weeks]) => {
      (weeks as any[]).forEach((week: any) => {
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

  const [sessionLog, setSessionLog] = useState<Record<string, ExerciseLog>>({});
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showSetLogger, setShowSetLogger] = useState<string | null>(null);
  const [showStatsModal, setShowStatsModal] = useState<string | null>(null);
  const [performanceStats, setPerformanceStats] = useState<Record<string, PerformanceStats>>({});

  // Persistent set logging: key for today's session
  const todayKey = `sessionLog_${new Date().toISOString().slice(0,10)}`;

  // Load saved sets on mount
  useEffect(() => {
    const saved = localStorage.getItem(todayKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessionLog(parsed);
      } catch {}
    }
  }, []);

  // Save sets to localStorage whenever sessionLog changes
  useEffect(() => {
    localStorage.setItem(todayKey, JSON.stringify(sessionLog));
  }, [sessionLog]);

  const { todaysWorkout, dayOfProgram, weekOfProgram, isCompletedToday } = useMemo(() => {
    if (!startDate) {
        return { 
            todaysWorkout: null, 
            dayOfProgram: 0, 
            weekOfProgram: 0, 
            isCompletedToday: false 
        };
    }
    
    // Determine the next workout based on completion history, not the calendar
    const workouts = flattenWorkouts(workoutHistory);
    const nextWorkoutIndex = workouts.length % workoutCategories.length;
    const nextCategory = workoutCategories[nextWorkoutIndex];
    
    // Check if the *next required* workout has been done today
    // Map nextCategory.id to dayType
    let dayType: string = '';
    switch (nextCategory.id) {
      case 'day1': dayType = 'chest_biceps'; break;
      case 'day2': dayType = 'back_triceps'; break;
      case 'day3': dayType = 'shoulders'; break;
      case 'day4': dayType = 'legs'; break;
      default: dayType = 'chest_biceps';
    }
    const lastWorkoutForCategory = workouts.filter(w => w.dayType === dayType).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).shift();
    const isCompletedToday = lastWorkoutForCategory ? isToday(new Date(lastWorkoutForCategory.startDate)) : false;

    // Day of program and week of program remain calendar-based for progress tracking
    const dayOfProgram = differenceInWeeks(new Date(), new Date(startDate)) * 7 + (new Date().getDay() || 7);
    const weekOfProgram = differenceInWeeks(new Date(), new Date(startDate)) + 1;

    const workoutDefinition = {
        id: nextCategory.id,
        name: nextCategory.name,
        exercises: exercises[nextCategory.id]
    };
    
    return {
        todaysWorkout: workoutDefinition,
        dayOfProgram,
        weekOfProgram,
        isCompletedToday: isCompletedToday,
    };
  }, [startDate, workoutHistory, disciplineMode]);

  // Refactored handleAddSet to save to Firestore with circular buffer logic
  const handleAddSet = async (exerciseName: string, set: Set) => {
    const currentLog = sessionLog[exerciseName] || { name: exerciseName, sets: [] };
    const newLog = { ...currentLog, sets: [...currentLog.sets, set] };
    setSessionLog(prev => ({ ...prev, [exerciseName]: newLog }));
    // Save to Firestore with circular buffer logic
    if (user) {
      const weekNum = weekOfProgram;
      const varKey = exerciseName.replace(/[\s\/]+/g, '_');
      const weeksCol = collection(db, 'users', user.uid, 'workouts', varKey, 'weeks');
      const weekDocs = await getDocs(weeksCol);
      const weekEntries = [];
      weekDocs.forEach(docSnap => {
        const data = docSnap.data();
        weekEntries.push({ id: docSnap.id, week: data.week });
      });
      // If there are already 3 weeks, delete the oldest
      if (weekEntries.length >= 3) {
        // Sort by week number or by Firestore doc id (if week number is not reliable)
        weekEntries.sort((a, b) => a.week - b.week);
        await deleteDoc(doc(db, 'users', user.uid, 'workouts', varKey, 'weeks', weekEntries[0].id));
      }
      await setDoc(
        doc(db, 'users', user.uid, 'workouts', varKey, 'weeks', `week_${weekNum}`),
        {
          sets: newLog.sets,
          week: weekNum,
          startDate: new Date().toISOString().slice(0, 10),
        },
        { merge: true }
      );
    }
  };

  // Refactored stats fetching for PB/LWB
  useEffect(() => {
    if (!todaysWorkout || !user) return;
    const loadStats = async () => {
      const stats: Record<string, PerformanceStats> = {};
      for (const exerciseName of todaysWorkout.exercises) {
        const varKey = exerciseName.replace(/[\s\/]+/g, '_');
        const pbSnap = await getDoc(doc(db, 'users', user.uid, 'workouts', varKey, 'meta', 'personal_best'));
        const weekSnap = await getDoc(doc(db, 'users', user.uid, 'workouts', varKey, 'weeks', `week_${weekOfProgram - 1}`));
        let pb = null;
        if (pbSnap.exists()) {
          const d = pbSnap.data();
          pb = {
            weight: d.weight || d.bestWeight || '',
            reps: d.reps || d.bestReps || '',
            achievedAt: d.achievedAt || d.timestamp || '',
          };
        }
        let lastWeekSets = null;
        if (weekSnap.exists()) {
          const d = weekSnap.data();
          lastWeekSets = {
            sets: d.sets || [],
            weekNumber: d.week || '',
            startDate: d.startDate || '',
          };
        }
        stats[exerciseName] = {
          personalBest: pb,
          lastWeekSets,
        };
      }
      setPerformanceStats(stats);
    };
    loadStats();
  }, [todaysWorkout, weekOfProgram, user]);

  const isSessionComplete = useMemo(() => {
    if (!todaysWorkout) return false;
    const allExercisesAttempted = todaysWorkout.exercises.every(exName => sessionLog[exName]);
    if (!allExercisesAttempted) return false;
    const allSetsCompleted = todaysWorkout.exercises.every(exName => sessionLog[exName].sets.length >= 4);
    return allSetsCompleted;
  }, [sessionLog, todaysWorkout]);

  const handleOpenMetricsModal = () => {
    if (!todaysWorkout || !isSessionComplete) {
      toast({ title: "Incomplete Workout", description: "You must log at least 4 sets for every exercise to complete the session.", variant: "destructive" });
      return;
    }
    setShowMetricsModal(true);
  };
  
  const handleSaveWorkout = async (details: any) => {
    if (!todaysWorkout) return;
    
    const exercisesInSession = Object.values(sessionLog).filter(ex => ex.sets.length > 0);
    
    // Save workout to main collection
    logWorkout({ category: todaysWorkout.id, exercises: exercisesInSession, ...details });
    
    // Save last week sets and personal bests for each exercise
    for (const exercise of exercisesInSession) {
      if (exercise.sets.length > 0) {
        // Save last week sets
        await saveLastWeekSets(exercise.name, exercise.sets, weekOfProgram);
        
        // Check for personal best
        const maxWeightSet = exercise.sets.reduce((best, current) => 
          current.weight > best.weight ? current : best
        );
        await savePersonalBest(exercise.name, maxWeightSet.weight, maxWeightSet.reps);
      }
    }
    
    // Update discipline streak in user doc
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      let streak = 1;
      if (userSnap.exists() && userSnap.data().disciplineStreak) {
        streak = userSnap.data().disciplineStreak + 1;
      }
      await updateDoc(userRef, { disciplineStreak: streak });
    }
    setShowMetricsModal(false);
    toast({
        title: "Session Forged",
        description: `Day ${dayOfProgram} | Week ${weekOfProgram}. The pain of today is the strength of tomorrow.`,
        duration: 5000,
    });
    setSessionLog({});
    localStorage.removeItem(todayKey);
  };

  if (!todaysWorkout) {
    return (
      <div className="p-4 flex flex-col items-center justify-center text-center h-full">
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle>Rest Day</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Recovery is part of the process. Your body is rebuilding. Come back tomorrow, stronger.</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompletedToday) {
      return (
        <div className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Card className="max-w-md bg-gradient-to-br from-card to-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-accent">
                        <CheckCircle className="w-8 h-8"/>
                        Session Complete
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="font-bold text-lg">Day {dayOfProgram} | Week {weekOfProgram}</p>
                    <p>Discipline acknowledged. The forge is quiet until tomorrow.</p>
                </CardContent>
            </Card>
      </div>
      );
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 duration-500">
        <MetricsModal open={showMetricsModal} onOpenChange={setShowMetricsModal} onSave={handleSaveWorkout} />
        <SetLoggerDialog 
            isOpen={!!showSetLogger} 
            onOpenChange={() => setShowSetLogger(null)} 
            onSave={(set) => showSetLogger && handleAddSet(showSetLogger, set)}
            stats={performanceStats[showSetLogger || ''] || { personalBest: null, lastWeekSets: null }}
            onStartTimer={onStartTimer}
        />
        <StatsModal
            isOpen={!!showStatsModal}
            onOpenChange={() => setShowStatsModal(null)}
            exerciseName={showStatsModal || ''}
            stats={performanceStats[showStatsModal || ''] || { personalBest: null, lastWeekSets: null }}
        />

      <Card>
        <CardHeader>
            <CardTitle className="text-2xl text-accent">{todaysWorkout.name}</CardTitle>
            <CardDescription>Day {dayOfProgram} of the Rebirth. Do not fail.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue={todaysWorkout.exercises[0]}>
              {todaysWorkout.exercises.map(exName => (
                <AccordionItem key={exName} value={exName}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        {(sessionLog[exName]?.sets?.length || 0) >= 4 && <CheckCircle className="w-5 h-5 text-green-500 animate-in fade-in zoom-in" />}
                        <span>{exName}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="flex gap-2">
                        <Button 
                            onClick={() => setShowStatsModal(exName)} 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                        >
                            <BarChart3 className="mr-2 h-4 w-4" /> Stats
                        </Button>
                        <Button 
                            onClick={() => setShowSetLogger(exName)} 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Set
                        </Button>
                    </div>
                    {sessionLog[exName]?.sets.map((set, i) => (
                        <div key={i} className="flex items-center p-3 rounded-md bg-secondary/50 animate-in fade-in-0 slide-in-from-top-2 duration-500 gap-2">
                            <div className="flex-1 flex flex-col">
                            <span className="font-semibold">Set {i+1}</span>
                            <span className="font-mono text-foreground">{set.weight} kg x {set.reps} reps</span>
                            </div>
                            <button
                                className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg"
                                onClick={() => {
                                    const newSets = sessionLog[exName].sets.filter((_, idx) => idx !== i);
                                    setSessionLog(prev => ({ ...prev, [exName]: { ...prev[exName], sets: newSets } }));
                                }}
                                aria-label="Delete set"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        </CardContent>
      </Card>
            
      <Button onClick={handleOpenMetricsModal} disabled={!isSessionComplete} className="w-full text-lg py-6 forged-button">
        {isSessionComplete ? "FORGE SESSION" : "WORK IS NOT DONE"}
      </Button>
    </div>
  );
}
