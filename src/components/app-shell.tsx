"use client";

import React, { useState } from 'react';
import { LayoutDashboard, Dumbbell, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dashboard } from './dashboard';
import { WorkoutTracker } from './workout-tracker';
import { FoodVision } from './food-vision';
import { Logo } from './icons/logo';

type Tab = 'dashboard' | 'workout' | 'food';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'workout':
        return <WorkoutTracker />;
      case 'food':
        return <FoodVision />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'workout', icon: Dumbbell, label: 'Workout' },
    { id: 'food', icon: Bot, label: 'Food Vision' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-background font-body">
      <header className="flex items-center justify-center p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Logo className="w-8 h-8" />
        <h1 className="text-xl font-bold text-foreground ml-2">38 Club</h1>
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
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={cn(
                        'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200',
                        isActive ? 'text-primary animate-pulse' : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{item.label}</span>
                </button>
            )
          })}
        </nav>
      </footer>
    </div>
  );
}
