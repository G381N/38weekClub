
"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Dumbbell, Bot, LogOut, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dashboard } from './dashboard';
import { WorkoutTracker } from './workout-tracker';
import { MealTracker } from './meal-tracker';
import { Logo } from './icons/logo';
import { useAuth } from '@/lib/auth';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const GlobalRestTimer = ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
    const [seconds, setSeconds] = useState(90);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isOpen && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(s => s - 1);
            }, 1000);
        } else if (seconds === 0 && isOpen) {
            // Optionally play a sound or close the dialog
            onOpenChange(false);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen, seconds, onOpenChange]);

    useEffect(() => {
        if (isOpen) {
            setSeconds(90); // Reset timer when opened
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xs">
                <DialogHeader>
                    <DialogTitle className="text-center text-accent">Rest Timer</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-8">
                    <div className="relative h-40 w-40">
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                            <circle
                                className="stroke-current text-muted"
                                strokeWidth="7"
                                cx="50"
                                cy="50"
                                r="45"
                                fill="transparent"
                            ></circle>
                            <circle
                                className="stroke-current text-primary transition-all duration-1000 ease-linear"
                                strokeWidth="7"
                                strokeDasharray={2 * Math.PI * 45}
                                strokeDashoffset={2 * Math.PI * 45 * (1 - seconds / 90)}
                                cx="50"
                                cy="50"
                                r="45"
                                fill="transparent"
                                transform="rotate(-90 50 50)"
                            ></circle>
                        </svg>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold font-mono text-foreground">
                                {String(Math.floor(seconds / 60)).padStart(2, '0')}:
                                {String(seconds % 60).padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


export function AppShell() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workout' | 'food'>('dashboard');
  const [isTimerOpen, setTimerOpen] = useState(false);
  const { signOut } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'workout':
        return <WorkoutTracker onStartTimer={() => setTimerOpen(true)} />;
      case 'food':
        return <MealTracker />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'workout', icon: Dumbbell, label: 'Workout' },
    { id: 'food', icon: Bot, label: 'Meal Tracker' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-background font-body">
       <GlobalRestTimer isOpen={isTimerOpen} onOpenChange={setTimerOpen} />
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center">
            <Logo className="w-8 h-8" />
            <h1 className="text-xl font-bold text-foreground ml-2 uppercase tracking-wider">38 Club</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={() => setTimerOpen(true)} variant="ghost" size="icon">
                <Timer className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button onClick={signOut} variant="ghost" size="icon">
                <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
        </div>
      </header>

      <main className="flex-1 pb-20">
        {renderContent()}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-10">
        <nav className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map(item => {
             const Icon = item.icon;
             const isActive = activeTab === item.id;
             return (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as 'dashboard' | 'workout' | 'food')}
                    className={cn(
                        'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200',
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <Icon className={cn('w-6 h-6 transition-transform duration-300', isActive && 'animate-pulse scale-110')} />
                    <span className="text-xs font-medium">{item.label}</span>
                </button>
            )
          })}
        </nav>
      </footer>
    </div>
  );
}
