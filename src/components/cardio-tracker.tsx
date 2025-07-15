
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Minus, Plus, Settings, Timer, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';

type CardioMode = 'newbie' | 'confident' | 'beast';

export function CardioTracker() {
  const [mode, setMode] = useState<CardioMode>('confident');
  const [duration, setDuration] = useState(10); // in minutes
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  const caloriesPerMinute = mode === 'newbie' ? 8 : mode === 'confident' ? 12 : 20;
  const targetCalories = duration * caloriesPerMinute;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSessionActive && elapsedTime < duration * 60) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        setCaloriesBurned(prev => prev + (caloriesPerMinute / 60));
      }, 1000);
    } else if (isSessionActive && elapsedTime >= duration * 60) {
      setIsSessionActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, elapsedTime, duration, caloriesPerMinute]);

  const handleStartStop = () => {
    if (isSessionActive) {
      setIsSessionActive(false);
    } else {
      if (elapsedTime >= duration * 60) {
        setElapsedTime(0);
        setCaloriesBurned(0);
      }
      setIsSessionActive(true);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const progressPercentage = (elapsedTime / (duration * 60)) * 100;

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Timer className="w-6 h-6" />
            Cardio Session
          </CardTitle>
          <CardDescription>Configure and start your cardio workout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center font-mono text-6xl font-bold tracking-tighter">
            {formatTime(elapsedTime)}
          </div>
          <Progress value={progressPercentage} />
          <div className="flex justify-center">
            <Button onClick={handleStartStop} size="lg" className="rounded-full w-24 h-24 forged-button">
              {isSessionActive ? <Pause size={32} /> : <Play size={32} />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Set Up Your Workout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-around">
              {(['newbie', 'confident', 'beast'] as CardioMode[]).map((m) => (
                <Button
                  key={m}
                  variant={mode === m ? 'default' : 'outline'}
                  onClick={() => setMode(m)}
                  className="capitalize"
                >
                  {m}
                </Button>
              ))}
            </div>
            <div className="flex justify-between items-center text-lg">
              <span>Workout Duration</span>
              <span className="font-bold">{duration} MIN</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span>Est. Calories</span>
              <span className="font-bold">{targetCalories} KCAL</span>
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
    </div>
  );
}
