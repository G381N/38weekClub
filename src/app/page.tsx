"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Onboarding } from '@/components/onboarding';
import { AppShell } from '@/components/app-shell';
import { CompletionScreen } from '@/components/completion-screen';
import { differenceInWeeks } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const isOnboarded = useAppStore(state => state.isOnboarded);
  const startDate = useAppStore(state => state.startDate);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const weeksCompleted = startDate ? differenceInWeeks(new Date(), new Date(startDate)) : 0;
  const isComplete = weeksCompleted >= 38;

  if (!isClient) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
            <div className="space-y-4 w-full max-w-sm">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
  }

  if (isOnboarded) {
    if (isComplete) {
      return <CompletionScreen />;
    }
    return <AppShell />;
  }

  return <Onboarding />;
}
