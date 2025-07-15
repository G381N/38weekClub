"use client";

import React from 'react';
import { useAuth } from '@/lib/auth';
import { useAppStore } from '@/lib/store';
import { Onboarding } from '@/components/onboarding';
import { AppShell } from '@/components/app-shell';
import { CompletionScreen } from '@/components/completion-screen';
import { Login } from '@/components/login';
import { differenceInWeeks } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const { user, loading } = useAuth();
    const { isOnboarded, startDate, setUserId, isInitialized } = useAppStore(state => ({
        isOnboarded: state.isOnboarded,
        startDate: state.startDate,
        setUserId: state.setUserId,
        isInitialized: state.isInitialized,
    }));
    
    // Connect user to the store once authenticated
    React.useEffect(() => {
        if (user) {
            setUserId(user.uid);
        }
    }, [user, setUserId]);

    if (loading || (user && !isInitialized)) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="mt-4 text-muted-foreground">Forging Your Experience...</p>
            </div>
        );
    }
    
    if (!user) {
        return <Login />;
    }

    if (!isOnboarded) {
        return <Onboarding />;
    }

    const weeksCompleted = startDate ? differenceInWeeks(new Date(), new Date(startDate)) : 0;
    const isComplete = weeksCompleted >= 38;

    if (isComplete) {
        return <CompletionScreen />;
    }

    return <AppShell />;
}
