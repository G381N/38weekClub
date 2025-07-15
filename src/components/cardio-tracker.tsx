
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Minus, Plus, Settings, Timer, Play, Pause, Power, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';

type CardioMode = 'newbie' | 'confident' | 'beast';

const SetupScreen = ({ onStart }: { onStart: (mode: CardioMode, duration: number) => void }) => {
    const [mode, setMode] = useState<CardioMode>('confident');
    const [duration, setDuration] = useState(20);

    const caloriesPerMinute = mode === 'newbie' ? 8 : mode === 'confident' ? 12 : 20;
    const targetCalories = duration * caloriesPerMinute;
    
    return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Settings className="w-6 h-6" />
              Setup Cardio Session
            </CardTitle>
            <CardDescription>Configure your workout, then begin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium">Select Intensity</p>
              <div className="flex justify-around">
                {(['newbie', 'confident', 'beast'] as CardioMode[]).map((m) => (
                  <Button
                    key={m}
                    variant={mode === m ? 'default' : 'outline'}
                    onClick={() => setMode(m)}
                    className="capitalize w-28"
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>
            
             <div className="space-y-2">
                <div className="flex justify-between items-center text-lg">
                    <span>Duration</span>
                    <span className="font-bold">{duration} MIN</span>
                </div>
                 <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setDuration(d => Math.max(5, d - 5))}><Minus/></Button>
                    <Progress value={(duration / 60) * 100} className="flex-1" />
                    <Button variant="outline" size="icon" onClick={() => setDuration(d => Math.min(120, d + 5))}><Plus/></Button>
                 </div>
            </div>

            <div className="flex justify-between items-center text-lg bg-secondary/50 p-3 rounded-md">
              <span className="flex items-center gap-2"><Flame /> Est. Calories</span>
              <span className="font-bold">{targetCalories} KCAL</span>
            </div>

          </CardContent>
          <CardFooter>
            <Button onClick={() => onStart(mode, duration)} className="w-full text-lg forged-button">
                <Play className="mr-2" /> Start Session
            </Button>
          </CardFooter>
        </Card>
    );
};

const SessionScreen = ({ mode, duration, onEndSession }: { mode: CardioMode, duration: number, onEndSession: () => void }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  
  const caloriesPerMinute = mode === 'newbie' ? 8 : mode === 'confident' ? 12 : 20;
  const totalDurationSeconds = duration * 60;
  const caloriesBurned = (elapsedTime / 60) * caloriesPerMinute;
  const targetCalories = duration * caloriesPerMinute;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isPaused && elapsedTime < totalDurationSeconds) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (elapsedTime >= totalDurationSeconds) {
       // Session ends automatically when time is up
       // You could add a sound or toast here
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, elapsedTime, totalDurationSeconds]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const progressPercentage = (elapsedTime / totalDurationSeconds) * 100;
  const isFinished = elapsedTime >= totalDurationSeconds;

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-accent">
                        <Timer className="w-6 h-6" />
                        Cardio In Progress...
                    </CardTitle>
                    <Button onClick={onEndSession} size="sm" variant="destructive">
                        <PowerOff className="mr-2 h-4 w-4" /> End
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="text-center font-mono text-6xl font-bold tracking-tighter">
                {formatTime(totalDurationSeconds - elapsedTime)}
            </div>
            <Progress value={progressPercentage} />
            <div className="flex justify-center">
                <Button onClick={() => setIsPaused(p => !p)} size="lg" className="rounded-full w-24 h-24 forged-button">
                    {isPaused || isFinished ? <Play size={32} /> : <Pause size={32} />}
                </Button>
            </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5" />
              Calories Burned
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <p className="text-5xl font-bold text-accent">{Math.floor(caloriesBurned)}</p>
            <p className="text-muted-foreground">out of {targetCalories} kcal</p>
          </CardContent>
        </Card>
    </div>
  )
}

export function CardioTracker() {
  const [session, setSession] = useState<{mode: CardioMode, duration: number} | null>(null);

  const handleStartSession = (mode: CardioMode, duration: number) => {
    setSession({ mode, duration });
  };
  
  const handleEndSession = () => {
      // Here you would typically save the session to the store/firebase
      setSession(null);
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 duration-500">
        {!session ? (
            <SetupScreen onStart={handleStartSession} />
        ) : (
            <SessionScreen 
                mode={session.mode} 
                duration={session.duration}
                onEndSession={handleEndSession}
            />
        )}
    </div>
  );
}
