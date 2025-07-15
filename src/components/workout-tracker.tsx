"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { workoutCategories, exercises, type WorkoutCategoryId } from '@/lib/data';
import { BrainCircuit, HeartPulse, Shield, TimerIcon, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Set = { reps: number; weight: number };
type ExerciseLog = { name: string; sets: Set[] };

const SetTracker = ({ exercise, onUpdate }: { exercise: ExerciseLog; onUpdate: (sets: Set[]) => void }) => {
  const addSet = () => onUpdate([...exercise.sets, { reps: 8, weight: 20 }]);
  const removeSet = (index: number) => onUpdate(exercise.sets.filter((_, i) => i !== index));
  const updateSet = (index: number, newSet: Set) => {
    const newSets = [...exercise.sets];
    newSets[index] = newSet;
    onUpdate(newSets);
  };

  return (
    <div className="space-y-4">
      {exercise.sets.map((set, index) => (
        <div key={index} className="p-3 rounded-md bg-secondary/50 space-y-3 relative">
          <h4 className="font-semibold">Set {index + 1}</h4>
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
                    <span className="text-lg font-mono">
                       {String(Math.floor(seconds / 60)).padStart(2, '0')}:
                       {String(seconds % 60).padStart(2, '0')}
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button onClick={toggle} variant={isActive ? "destructive" : "default"} size="sm">{isActive ? 'Pause' : 'Start'}</Button>
                    <Button onClick={reset} variant="outline" size="sm">Reset</Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function WorkoutTracker() {
  const { toast } = useToast();
  const logWorkout = useAppStore(state => state.logWorkout);
  const [currentCategory, setCurrentCategory] = useState<WorkoutCategoryId>('chest_biceps');
  const [sessionLog, setSessionLog] = useState<Record<string, ExerciseLog>>({});
  const [sickButConsistent, setSickButConsistent] = useState(false);
  const [beastState, setBeastState] = useState({ mood: 5, painLevel: 5, mentalDiscipline: 5 });
  const [notes, setNotes] = useState("");

  const handleExerciseUpdate = (exerciseName: string, sets: Set[]) => {
    setSessionLog(prev => ({ ...prev, [exerciseName]: { name: exerciseName, sets } }));
  };

  const handleSaveWorkout = () => {
    const exercisesInSession = Object.values(sessionLog).filter(ex => ex.sets.length > 0);
    if(exercisesInSession.length === 0){
      toast({ title: "Empty Workout", description: "Add at least one set to log your workout.", variant: "destructive" });
      return;
    }

    logWorkout({
        category: currentCategory,
        exercises: exercisesInSession,
        sickButConsistent,
        ...beastState,
        notes,
    });
    toast({ title: "Workout Logged!", description: "Your discipline has been recorded." });
    setSessionLog({});
    setNotes("");
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 duration-500">
      <Tabs defaultValue="chest_biceps" onValueChange={val => setCurrentCategory(val as WorkoutCategoryId)}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          {workoutCategories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
          ))}
        </TabsList>

        {workoutCategories.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-4 mt-4">
            <Accordion type="single" collapsible className="w-full">
              {exercises[cat.id].map(exName => (
                <AccordionItem key={exName} value={exName}>
                  <AccordionTrigger>{exName}</AccordionTrigger>
                  <AccordionContent>
                    <SetTracker 
                      exercise={sessionLog[exName] || { name: exName, sets: [] }} 
                      onUpdate={(sets) => handleExerciseUpdate(exName, sets)} 
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
      
      <RestTimer />

      <Card>
          <CardHeader>
              <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sick-mode" className="flex flex-col gap-1.5">
                    <span>Sick But Consistent</span>
                    <span className="font-normal text-sm text-muted-foreground">For training under stress or illness.</span>
                </Label>
                <Switch id="sick-mode" checked={sickButConsistent} onCheckedChange={setSickButConsistent} />
              </div>

              <Textarea placeholder="Optional notes on your session..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Beast Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><HeartPulse /> Mood: {beastState.mood}/10</Label>
            <Slider value={[beastState.mood]} onValueChange={([val]) => setBeastState(s => ({ ...s, mood: val }))} min={1} max={10} step={1} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Shield /> Pain Level: {beastState.painLevel}/10</Label>
            <Slider value={[beastState.painLevel]} onValueChange={([val]) => setBeastState(s => ({ ...s, painLevel: val }))} min={1} max={10} step={1} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><BrainCircuit /> Mental Discipline: {beastState.mentalDiscipline}/10</Label>
            <Slider value={[beastState.mentalDiscipline]} onValueChange={([val]) => setBeastState(s => ({ ...s, mentalDiscipline: val }))} min={1} max={10} step={1} />
          </div>
        </CardContent>
      </Card>
      
      <Button onClick={handleSaveWorkout} className="w-full text-lg py-6 bg-primary/90 hover:bg-primary">Log Workout</Button>
    </div>
  );
}
