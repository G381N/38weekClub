"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { analyzeFoodImage, type AnalyzeFoodImageOutput } from '@/ai/flows/analyze-food-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, BrainCircuit, Flame, Drumstick, Wheat, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Meal } from '@/lib/types';

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
            <p className="text-xs text-muted-foreground">{new Date(meal.timestamp).toLocaleString()}</p>
            <div className="flex gap-4 mt-1 text-xs">
                <span>🔥{meal.calories.toFixed(0)}</span>
                <span>🍗{meal.protein.toFixed(0)}g</span>
                <span>🍞{meal.carbs.toFixed(0)}g</span>
                <span>💧{meal.fat.toFixed(0)}g</span>
            </div>
        </div>
    </div>
);


export function FoodVision() {
    const { toast } = useToast();
    const { meals, logMeal } = useAppStore(state => ({ meals: state.meals, logMeal: state.logMeal }));
    const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalyzeFoodImageOutput | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        } catch (error) {
            console.error('AI analysis failed:', error);
            toast({ title: 'Analysis Failed', description: 'Could not analyze the image. Please try again.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-6 animate-in fade-in-0 duration-500">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Food Vision Tracker</CardTitle>
                    <CardDescription>Scan a meal with your camera to estimate its nutritional content.</CardDescription>
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
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Analyze Meal'}
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
                    <CardTitle>Recent Meals</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72">
                        <div className="space-y-4">
                            {meals.length > 0 ? meals.map(meal => <MealLogItem key={meal.id} meal={meal} />) : <p className="text-muted-foreground text-center">No meals logged yet.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

        </div>
    );
}
