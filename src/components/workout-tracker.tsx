
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { workoutCategories, exercises, type WorkoutCategoryId } from '@/lib/data';
import { BrainCircuit, HeartPulse, Shield, TimerIcon, Plus, Trash2, CheckCircle, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays, isToday, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

type Set = { reps: number; weight: number };
type ExerciseLog = { name: string; sets: Set[] };
type PreviousPerformance = { reps: number, weight: number } | null;

const SetTracker = ({ exercise, onUpdate, previousPerformance }: { exercise: ExerciseLog; onUpdate: (sets: Set[]) => void; previousPerformance: PreviousPerformance }) => {
  const addSet = () => onUpdate([...exercise.sets, { reps: 8, weight: 20 }]);
  const removeSet = (index: number) => onUpdate(exercise.sets.filter((_, i) => i !== index));
  const updateSet = (index: number, newSet: Set) => {
    const newSets = [...exercise.sets];
    newSets[index] = newSet;
    onUpdate(newSets);
  };

  return (
    <div className="space-y-4">
        {previousPerformance && (
            <div className="text-xs text-center text-muted-foreground p-2 bg-background rounded-md">
                Last time: {previousPerformance.weight} kg x {previousPerformance.reps} reps
            </div>
        )}
      {exercise.sets.map((set, index) => (
        <div key={index} className="p-3 rounded-md bg-secondary/50 space-y-3 relative">
          <h4 className="font-semibold text-foreground">Set {index + 1}</h4>
          <div className="space-y-2">
            <Label>Reps: {set.reps}</Label>
            <Slider value={[set.reps]} onValueChange={([val]) => updateSet(index, { ...set, reps: val })} min={1} max={30} step={1} />
          </div>
          <div className="space-y-2">
            <Label>Weight: {set.weight} kg</Label>
            <Slider value={[set.weight]} onValueChange={([val]) => updateSet(index, { ...set, weight: val })} min={0} max={300} step={2.5} />
          </div>
          {exercise.sets.length > 1 && (
             <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeSet(index)}>
                <Trash2 className="w-4 h-4 text-destructive" />
             </Button>
          )}
        </div>
      ))}
      <Button onClick={addSet} variant="outline" className="w-full"><Plus className="mr-2 h-4 w-4" /> Add Set</Button>
    </div>
  );
};

const RestTimer = () => {
    const [seconds, setSeconds] = useState(60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(s => s - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
            // Optional: Play a sound
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, seconds]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setIsActive(false);
        setSeconds(60);
    }

    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TimerIcon className="text-accent" />
                    <span className="text-lg font-mono text-foreground">
                       {String(Math.floor(seconds / 60)).padStart(2, '0')}:
                       {String(seconds % 60).padStart(2, '0')}
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button onClick={toggle} variant={isActive ? "destructive" : "default"} size="sm" className="forged-button">{isActive ? 'Pause' : 'Start'}</Button>
                    <Button onClick={reset} variant="outline" size="sm">Reset</Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function WorkoutTracker() {
  const { toast } = useToast();
  const { logWorkout, startDate, disciplineMode, workouts } = useAppStore(state => ({
    logWorkout: state.logWorkout,
    startDate: state.startDate,
    disciplineMode: state.disciplineMode,
    workouts: state.workouts
  }));

  const [sessionLog, setSessionLog] = useState<Record<string, ExerciseLog>>({});
  const [sickButConsistent, setSickButConsistent] = useState(false);
  const [beastState, setBeastState] = useState({ mood: 5, painLevel: 1, mentalDiscipline: 5 });
  const [notes, setNotes] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const { todaysWorkout, dayOfProgram, weekOfProgram, isCompletedToday } = useMemo(() => {
    if (!startDate) return { todaysWorkout: null, dayOfProgram: 0, weekOfProgram: 0, isCompletedToday: false };
    
    const start = new Date(startDate);
    const today = new Date();
    
    const dayIndex = differenceInDays(today, start);
    const weekIndex = Math.floor(dayIndex / 7) + 1;
    const dayOfWeekIndex = (dayIndex % 7) + 1;

    const lastWorkoutToday = workouts.filter(w => isToday(parseISO(w.timestamp))).pop();

    let category: WorkoutCategoryId | null = null;
    if (disciplineMode === 'intense') {
        const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1
        const intenseDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday is 0
        if(intenseDayIndex < 4) { // Only workout Mon-Thu
             category = workoutCategories[intenseDayIndex].id;
        }
    } else {
        const workoutDayIndex = dayIndex % 4; // Cycle through 4 workout days
        category = workoutCategories[workoutDayIndex].id;
    }

    return {
        todaysWorkout: category ? { id: category, exercises: exercises[category] } : null,
        dayOfProgram: dayIndex + 1,
        weekOfProgram: weekIndex,
        isCompletedToday: !!lastWorkoutToday
    };
  }, [startDate, workouts, disciplineMode]);

  const previousPerformances = useMemo(() => {
    const performanceMap: Record<string, PreviousPerformance> = {};
    if (!todaysWorkout) return performanceMap;

    todaysWorkout.exercises.forEach(exName => {
        const relevantWorkouts = workouts
            .filter(w => w.exercises.some(e => e.name === exName))
            .reverse();
        
        for (const workout of relevantWorkouts) {
            const exerciseLog = workout.exercises.find(e => e.name === exName);
            if(exerciseLog && exerciseLog.sets.length > 0) {
                // Find the best set from that session
                const bestSet = exerciseLog.sets.reduce((best, current) => current.weight > best.weight ? current : best, exerciseLog.sets[0]);
                performanceMap[exName] = { reps: bestSet.reps, weight: bestSet.weight };
                return; // Move to the next exercise once we've found the last performance
            }
        }
        performanceMap[exName] = null;
    });

    return performanceMap;
  }, [workouts, todaysWorkout]);


  const handleExerciseUpdate = (exerciseName: string, sets: Set[]) => {
    setSessionLog(prev => ({ ...prev, [exerciseName]: { name: exerciseName, sets } }));
  };

  const isSessionComplete = useMemo(() => {
    if (!todaysWorkout) return false;
    // Every exercise for today must be in the log
    const allExercisesAttempted = todaysWorkout.exercises.every(exName => sessionLog[exName]);
    if (!allExercisesAttempted) return false;
    // Every logged exercise must have at least 4 sets
    const allSetsCompleted = todaysWorkout.exercises.every(exName => sessionLog[exName].sets.length >= 4);
    return allSetsCompleted;
  }, [sessionLog, todaysWorkout]);

  const handleSaveWorkout = () => {
    if (!todaysWorkout || !isSessionComplete) {
      toast({ title: "Incomplete Workout", description: "You must log at least 4 sets for every exercise to complete the session.", variant: "destructive" });
      return;
    }

    const exercisesInSession = Object.values(sessionLog).filter(ex => ex.sets.length > 0);

    logWorkout({
        category: todaysWorkout.id,
        exercises: exercisesInSession,
        sickButConsistent,
        ...beastState,
        notes,
    });
    setShowCompletionModal(true);
    setSessionLog({});
    setNotes("");
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
        <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl text-accent flex flex-col items-center gap-2">
                        <Flame className="w-12 h-12" />
                        SESSION FORGED
                    </DialogTitle>
                </DialogHeader>
                <div className="text-center space-y-2">
                     <p className="font-bold text-lg">Day {dayOfProgram} | Week {weekOfProgram}</p>
                     <p className="text-muted-foreground">The pain of today is the strength of tomorrow. See you at the forge.</p>
                </div>
                 <Button onClick={() => setShowCompletionModal(false)}>Acknowledge</Button>
            </DialogContent>
        </Dialog>


      <Card>
        <CardHeader>
            <CardTitle className="text-2xl text-accent">{todaysWorkout.id.replace(/_/g, ' & ').toUpperCase()}</CardTitle>
            <CardDescription>Day {dayOfProgram} of the Rebirth. Do not fail.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue={todaysWorkout.exercises[0]}>
              {todaysWorkout.exercises.map(exName => (
                <AccordionItem key={exName} value={exName}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        {(sessionLog[exName]?.sets?.length || 0) >= 4 && <CheckCircle className="w-5 h-5 text-green-500" />}
                        <span>{exName}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <SetTracker 
                      exercise={sessionLog[exName] || { name: exName, sets: [] }} 
                      onUpdate={(sets) => handleExerciseUpdate(exName, sets)} 
                      previousPerformance={previousPerformances[exName]}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        </CardContent>
      </Card>
      
      <RestTimer />

      <Card>
          <CardHeader>
              <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-md bg-secondary/30">
                <Label htmlFor="sick-mode" className="flex flex-col gap-1.5 cursor-pointer">
                    <span>Sick But Consistent</span>
                    <span className="font-normal text-xs text-muted-foreground">For training under stress or illness.</span>
                </Label>
                <Switch id="sick-mode" checked={sickButConsistent} onCheckedChange={setSickButConsistent} />
              </div>
              <Textarea placeholder="Optional notes on your session..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Beast-State Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>
      
      <Button onClick={handleSaveWorkout} disabled={!isSessionComplete} className="w-full text-lg py-6 forged-button">
        {isSessionComplete ? "COMPLETE SESSION" : "WORK IS NOT DONE"}
      </Button>
    </div>
  );
}
