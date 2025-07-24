
"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { analyzeFoodImage, type AnalyzeFoodImageOutput } from '@/ai/flows/analyze-food-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, BrainCircuit, Flame, Drumstick, Wheat, Droplets, Target, HeartPulse } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Meal } from '@/lib/types';
import { isToday, parseISO } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const ResultCard = ({ result }: { result: AnalyzeFoodImageOutput }) => (
    <Card className="bg-secondary/50">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BrainCircuit/> Analysis complete</CardTitle>
            <CardDescription>{result.summary}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2"><Flame className="text-accent" /><div><p className="font-bold">{result.calories.toFixed(0)}</p><p className="text-xs text-muted-foreground">Calories</p></div></div>
            <div className="flex items-center gap-2"><Drumstick className="text-accent" /><div><p className="font-bold">{result.protein.toFixed(1)}g</p><p className="text-xs text-muted-foreground">Protein</p></div></div>
            <div className="flex items-center gap-2"><Wheat className="text-accent" /><div><p className="font-bold">{result.carbs.toFixed(1)}g</p><p className="text-xs text-muted-foreground">Carbs</p></div></div>
            <div className="flex items-center gap-2"><Droplets className="text-accent" /><div><p className="font-bold">{result.fat.toFixed(1)}g</p><p className="text-xs text-muted-foreground">Fat</p></div></div>
        </CardContent>
    </Card>
);

const MealLogItem = ({ meal }: { meal: Meal }) => (
    <div className="flex gap-4 p-2 bg-card rounded-lg">
        <Image src={meal.photoDataUri} alt="Meal" width={64} height={64} className="rounded-md object-cover w-16 h-16" />
        <div className="flex-1 text-sm">
            <p className="font-bold">{meal.summary}</p>
            <p className="text-xs text-muted-foreground">{new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <div className="flex gap-4 mt-1 text-xs">
                <span>🔥{meal.calories.toFixed(0)}</span>
                <span>🍗{meal.protein.toFixed(0)}g</span>
                <span>🍞{meal.carbs.toFixed(0)}g</span>
                <span>💧{meal.fat.toFixed(0)}g</span>
            </div>
        </div>
    </div>
);

const HealthStatsDialog = () => {
    const [weight, setWeight] = useState(75);
    const [bodyFat, setBodyFat] = useState(15);
    const [isOpen, setIsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const { user } = useAuth();
    const { userMetrics } = useAppStore();
    const { toast } = useToast();

    useEffect(() => {
        if (userMetrics) {
            setWeight(userMetrics.weight);
            setBodyFat(userMetrics.bodyFat);
        }
    }, [userMetrics]);

    const handleUpdate = async () => {
        if (!user) {
            toast({ title: 'Error', description: 'Please log in to update health stats', variant: 'destructive' });
            return;
        }

        setIsUpdating(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                weight,
                bodyFat,
                lastUpdated: new Date().toISOString()
            });

            // Health stats updated in Firestore, will be synced on next app load
            
            toast({
                title: 'Health Stats Updated',
                description: 'Your weight and body fat have been successfully updated'
            });
            
            setIsOpen(false);
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: 'Failed to update health stats. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <HeartPulse className="w-4 h-4 mr-2" />
                    Update Health Stats
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 text-accent" />
                        Update Health Stats
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Weight: {weight} kg</label>
                        <Slider
                            value={[weight]}
                            onValueChange={([value]) => setWeight(value)}
                            min={30}
                            max={200}
                            step={0.5}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Body Fat: {bodyFat}%</label>
                        <Slider
                            value={[bodyFat]}
                            onValueChange={([value]) => setBodyFat(value)}
                            min={3}
                            max={50}
                            step={0.5}
                            className="w-full"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} disabled={isUpdating} className="forged-button">
                        {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Update Stats
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const DailyTotalsCard = ({ totals }: { totals: { calories: number; protein: number; carbs: number; fat: number } }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target /> Today's Totals</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/30">
                <Flame className="w-5 h-5 text-accent" />
                <div>
                    <p className="font-bold text-lg">{totals.calories.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                </div>
            </div>
             <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/30">
                <Drumstick className="w-5 h-5 text-accent" />
                <div>
                    <p className="font-bold text-lg">{totals.protein.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                </div>
            </div>
             <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/30">
                <Wheat className="w-5 h-5 text-accent" />
                <div>
                    <p className="font-bold text-lg">{totals.carbs.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
            </div>
             <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/30">
                <Droplets className="w-5 h-5 text-accent" />
                <div>
                    <p className="font-bold text-lg">{totals.fat.toFixed(1)}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

export function MealTracker() {
    const { toast } = useToast();
    const { meals, logMeal } = useAppStore(state => ({ meals: state.meals, logMeal: state.logMeal }));
    const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalyzeFoodImageOutput | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const dailyTotals = useMemo(() => {
        const todaysMeals = meals.filter(meal => isToday(parseISO(meal.timestamp)));
        return todaysMeals.reduce((acc, meal) => ({
            calories: acc.calories + meal.calories,
            protein: acc.protein + meal.protein,
            carbs: acc.carbs + meal.carbs,
            fat: acc.fat + meal.fat,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [meals]);
    
    const todaysLoggedMeals = useMemo(() => {
        return meals
            .filter(meal => isToday(parseISO(meal.timestamp)))
            .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
    }, [meals]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setResult(null);
            const uri = await fileToDataUri(file);
            setPhotoDataUri(uri);
        }
    };

    const handleAnalyze = async () => {
        if (!photoDataUri) {
            toast({ title: 'No Photo Selected', description: 'Please select a photo of your meal.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const analysisResult = await analyzeFoodImage({ photoDataUri, notes });
            setResult(analysisResult);
            logMeal({ ...analysisResult, notes, photoDataUri });
            toast({ title: 'Meal Analyzed', description: 'Nutritional estimates have been logged.' });
            setPhotoDataUri(null); // Reset photo after analysis
            setNotes(''); // Reset notes
        } catch (error) {
            console.error('AI analysis failed:', error);
            toast({ title: 'Analysis Failed', description: 'Could not analyze the image. Please try again.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-6 animate-in fade-in-0 duration-500">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground uppercase tracking-wider">
                    Health Tracker
                </h1>
                <p className="text-muted-foreground">
                    Track your nutrition and monitor your health progress
                </p>
            </div>

            {/* Health Stats Update */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 text-accent" />
                        Health Management
                    </CardTitle>
                    <CardDescription>
                        Keep your health metrics up to date for better AI recommendations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <HealthStatsDialog />
                </CardContent>
            </Card>

            <DailyTotalsCard totals={dailyTotals} />

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Log a Meal</CardTitle>
                    <CardDescription>Scan a meal to add it to your daily log.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div 
                        className="relative w-full h-64 bg-muted rounded-md flex items-center justify-center border-2 border-dashed border-border cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {photoDataUri ? (
                            <Image src={photoDataUri} alt="Selected meal" layout="fill" objectFit="cover" className="rounded-md" />
                        ) : (
                            <div className="flex flex-col items-center text-muted-foreground">
                                <Upload className="w-12 h-12" />
                                <p>Tap to upload a photo</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    <Textarea
                        placeholder="Add notes like '2 rotis with ghee' or 'No oil in paneer'..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </CardContent>
                <CardFooter>
                    <Button onClick={handleAnalyze} disabled={isLoading || !photoDataUri} className="w-full">
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Analyze & Log Meal'}
                    </Button>
                </CardFooter>
            </Card>

            {isLoading && (
                 <div className="flex justify-center items-center p-8 bg-card rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="ml-4">AI is analyzing your meal...</p>
                 </div>
            )}

            {result && <ResultCard result={result} />}

            <Card>
                <CardHeader>
                    <CardTitle>Today's Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72">
                        <div className="space-y-4">
                            {todaysLoggedMeals.length > 0 ? todaysLoggedMeals.map(meal => <MealLogItem key={meal.id} meal={meal} />) : <p className="text-muted-foreground text-center">No meals logged today.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

        </div>
    );
}
