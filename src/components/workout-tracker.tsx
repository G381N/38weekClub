
"use client";

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { workoutCategories, exercises, type WorkoutCategoryId } from '@/lib/data';
import { BrainCircuit, HeartPulse, Shield, Plus, CheckCircle, Flame, Dumbbell, Repeat, History, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays, isToday, parseISO, subDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';

type Set = { reps: number; weight: number };
type ExerciseLog = { name: string; sets: Set[] };
type PerformanceStats = {
    personalBest: Set | null;
    lastWeekBest: Set | null;
};

// --- DIALOGS ---

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
    const [set, setSet] = useState<Set>({ reps: 8, weight: 20 });

    const handleSave = () => {
        onSave(set);
        onOpenChange(false);
        onStartTimer();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Dumbbell /> Log Your Set</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 my-4 text-center">
                    <div className="p-2 bg-secondary/50 rounded-lg">
                        <p className="text-xs text-muted-foreground font-bold flex items-center justify-center gap-1"><Award /> PB</p>
                        <p className="font-mono text-lg">{stats.personalBest ? `${stats.personalBest.weight}kg x ${stats.personalBest.reps}` : 'N/A'}</p>
                    </div>
                     <div className="p-2 bg-secondary/50 rounded-lg">
                        <p className="text-xs text-muted-foreground font-bold flex items-center justify-center gap-1"><History /> Last Week</p>
                        <p className="font-mono text-lg">{stats.lastWeekBest ? `${stats.lastWeekBest.weight}kg x ${stats.lastWeekBest.reps}` : 'N/A'}</p>
                    </div>
                </div>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label className="flex justify-between items-center"><Repeat /> Reps <span className="text-2xl font-mono">{set.reps}</span></Label>
                        <Slider value={[set.reps]} onValueChange={([val]) => setSet(s => ({ ...s, reps: val }))} min={1} max={30} step={1} />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex justify-between items-center"><Dumbbell /> Weight <span className="text-2xl font-mono">{set.weight} kg</span></Label>
                        <Slider value={[set.weight]} onValueChange={([val]) => setSet(s => ({ ...s, weight: val }))} min={0} max={300} step={2.5} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} className="w-full text-lg forged-button">Log Set & Start Timer</Button>
                </DialogFooter>
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
  const { logWorkout, startDate, disciplineMode, workouts } = useAppStore(state => ({
    logWorkout: state.logWorkout,
    startDate: state.startDate,
    disciplineMode: state.disciplineMode,
    workouts: state.workouts
  }));

  const [sessionLog, setSessionLog] = useState<Record<string, ExerciseLog>>({});
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showSetLogger, setShowSetLogger] = useState<string | null>(null);

  const { todaysWorkout, dayOfProgram, weekOfProgram, isCompletedToday } = useMemo(() => {
    if (!startDate) return { todaysWorkout: null, dayOfProgram: 0, weekOfProgram: 0, isCompletedToday: false };
    
    const start = new Date(startDate);
    const today = new Date();
    
    const dayIndex = differenceInDays(today, start);
    const weekIndex = Math.floor(dayIndex / 7) + 1;

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

  const performanceStats = useMemo(() => {
    const stats: Record<string, PerformanceStats> = {};
    if (!todaysWorkout) return stats;

    const oneWeekAgo = subDays(new Date(), 7);

    todaysWorkout.exercises.forEach(exName => {
        const allSetsForExercise = workouts
            .flatMap(w => w.exercises.find(e => e.name === exName)?.sets || [])
            .filter(s => s.weight > 0);

        const personalBest = allSetsForExercise.length > 0
            ? allSetsForExercise.reduce((best, current) => current.weight > best.weight ? current : best)
            : null;

        const lastWeekSets = workouts
            .filter(w => parseISO(w.timestamp) >= oneWeekAgo)
            .flatMap(w => w.exercises.find(e => e.name === exName)?.sets || [])
            .filter(s => s.weight > 0);
        
        const lastWeekBest = lastWeekSets.length > 0 
            ? lastWeekSets.reduce((best, current) => current.weight > best.weight ? current : best)
            : null;

        stats[exName] = { personalBest, lastWeekBest };
    });
    return stats;
  }, [workouts, todaysWorkout]);


  const handleAddSet = (exerciseName: string, set: Set) => {
    const currentLog = sessionLog[exerciseName] || { name: exerciseName, sets: [] };
    const newLog = { ...currentLog, sets: [...currentLog.sets, set] };
    setSessionLog(prev => ({ ...prev, [exerciseName]: newLog }));
  };

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
  
  const handleSaveWorkout = (details: any) => {
    if (!todaysWorkout) return;
    const exercisesInSession = Object.values(sessionLog).filter(ex => ex.sets.length > 0);
    logWorkout({ category: todaysWorkout.id, exercises: exercisesInSession, ...details });
    setShowMetricsModal(false);
    toast({
        title: "Session Forged",
        description: `Day ${dayOfProgram} | Week ${weekOfProgram}. The pain of today is the strength of tomorrow.`,
        duration: 5000,
    });
    setSessionLog({});
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
            stats={performanceStats[showSetLogger || ''] || { personalBest: null, lastWeekBest: null }}
            onStartTimer={onStartTimer}
        />

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
                        {(sessionLog[exName]?.sets?.length || 0) >= 4 && <CheckCircle className="w-5 h-5 text-green-500 animate-in fade-in zoom-in" />}
                        <span>{exName}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    {sessionLog[exName]?.sets.map((set, i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-md bg-secondary/50 animate-in fade-in-0 slide-in-from-top-2 duration-500">
                            <span className="font-semibold">Set {i+1}</span>
                            <span className="font-mono text-foreground">{set.weight} kg x {set.reps} reps</span>
                        </div>
                    ))}
                    <Button onClick={() => setShowSetLogger(exName)} variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add Set
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        </CardContent>
      </Card>
            
      <Button onClick={handleOpenMetricsModal} disabled={!isSessionComplete} className="w-full text-lg py-6 forged-button">
        {isSessionComplete ? "COMPLETE SESSION" : "WORK IS NOT DONE"}
      </Button>
    </div>
  );
}
