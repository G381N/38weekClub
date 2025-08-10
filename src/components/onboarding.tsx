"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { type UserMetrics, type PhysiquePhotos, type DisciplineMode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, ShieldCheck, User } from 'lucide-react';
import { Logo } from './icons/logo';

const StepIndicator = ({ current, total }: { current: number; total: number }) => (
  <div className="flex justify-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-2 w-12 rounded-full transition-colors duration-300 ${i + 1 <= current ? 'bg-primary' : 'bg-muted'}`}
      />
    ))}
  </div>
);

const MetricsStep = ({ onNext }: { onNext: (data: { metrics: UserMetrics }) => void }) => {
  const [metrics, setMetrics] = useState<UserMetrics>({
    weight: 75,
    bodyFat: 20,
    height: 180,
    maintenanceCalories: 2500,
  });

  const handleSliderChange = (key: keyof UserMetrics) => ([value]: number[]) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full max-w-md bg-transparent border-border animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl uppercase"><User /> Your Starting Point</CardTitle>
        <CardDescription>Enter your current stats to begin the journey.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Weight: {metrics.weight} kg</Label>
          <Slider defaultValue={[75]} min={30} max={200} step={1} onValueChange={handleSliderChange('weight')} />
        </div>
        <div className="space-y-2">
          <Label>Body Fat: {metrics.bodyFat}%</Label>
          <Slider defaultValue={[20]} min={3} max={50} step={1} onValueChange={handleSliderChange('bodyFat')} />
        </div>
        <div className="space-y-2">
          <Label>Height: {metrics.height} cm</Label>
          <Slider defaultValue={[180]} min={120} max={230} step={1} onValueChange={handleSliderChange('height')} />
        </div>
        <div className="space-y-2">
          <Label>Maintenance Calories: {metrics.maintenanceCalories} kcal</Label>
          <Slider defaultValue={[2500]} min={1000} max={6000} step={100} onValueChange={handleSliderChange('maintenanceCalories')} />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onNext({ metrics })} className="w-full text-lg forged-button">Next</Button>
      </CardFooter>
    </Card>
  );
};

const PhotoStep = ({ onNext, onSkip }: { onNext: (data: { photos: PhysiquePhotos }) => void; onSkip: () => void }) => {
  return (
     <Card className="w-full max-w-md bg-transparent border-border animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl uppercase"><Camera /> Physique Photos</CardTitle>
        <CardDescription>Optional: Take 4 photos to document your start. This is for your eyes only.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {['Front', 'Back', 'Side', 'Flex'].map(label => (
          <div key={label} className="flex items-center justify-center p-4 h-24 bg-muted rounded-md text-muted-foreground">
            {label}
          </div>
        ))}
        <p className="text-xs text-muted-foreground col-span-2">Photo uploads are disabled in this demo.</p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onSkip} variant="outline" className="w-full">Skip</Button>
        <Button onClick={() => onNext({ photos: {} })} className="w-full text-lg forged-button">Next</Button>
      </CardFooter>
    </Card>
  );
};

const ModeStep = ({ onNext }: { onNext: (data: { mode: DisciplineMode }) => void }) => {
  const [mode, setMode] = useState<DisciplineMode>('normal');

  return (
    <Card className="w-full max-w-md bg-transparent border-border animate-in fade-in-0 slide-in-from-bottom-10 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl uppercase"><ShieldCheck /> Choose Your Path</CardTitle>
        <CardDescription>This choice is permanent and defines your journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={mode} onValueChange={(value) => setMode(value as DisciplineMode)} className="space-y-4">
          <Label htmlFor="normal-mode" className="flex items-start gap-4 p-4 rounded-md border-2 border-border has-[input:checked]:border-primary transition-all cursor-pointer bg-secondary/20">
            <RadioGroupItem value="normal" id="normal-mode" />
            <div className="grid gap-1.5">
              <p className="font-semibold text-lg">NORMAL MODE</p>
              <p className="text-sm text-muted-foreground">Workout 4 days/week. Extra workouts grant rollover rest days.</p>
            </div>
          </Label>
          <Label htmlFor="intense-mode" className="flex items-start gap-4 p-4 rounded-md border-2 border-destructive/50 has-[input:checked]:border-primary has-[input:checked]:bg-destructive/10 transition-all cursor-pointer bg-secondary/20">
            <RadioGroupItem value="intense" id="intense-mode" />
            <div className="grid gap-1.5">
               <p className="font-semibold text-lg text-destructive-foreground">INTENSE MODE</p>
               <p className="text-sm text-muted-foreground">Workout 4 days/week without fail. Missing a single week resets your entire 38-week streak.</p>
            </div>
          </Label>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onNext({ mode })} className="w-full text-lg forged-button">Begin Transformation</Button>
      </CardFooter>
    </Card>
  );
};

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<{
    metrics?: UserMetrics;
    photos?: PhysiquePhotos;
    mode?: DisciplineMode;
  }>({});
  const completeOnboarding = useAppStore(state => state.completeOnboarding);

  const handleNext = (data: Record<string, unknown>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setStep(s => s + 1);
  };

  const handleSkipPhotos = () => {
    setOnboardingData(prev => ({ ...prev, photos: {} }));
    setStep(s => s + 1);
  }

  const handleFinish = (data: { mode: DisciplineMode }) => {
    const finalData = { ...onboardingData, ...data };
    if (finalData.metrics && finalData.mode) {
      completeOnboarding({
        metrics: finalData.metrics,
        photos: finalData.photos || {},
        mode: finalData.mode,
      });
    }
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background font-headline">
       <div className="flex flex-col items-center text-center mb-8">
        <Logo className="w-20 h-20" />
        <h1 className="text-5xl font-bold text-foreground mt-4 uppercase">38 Club</h1>
        <p className="text-muted-foreground">You are about to be reborn.</p>
      </div>

      <div className="w-full max-w-md">
        <StepIndicator current={step} total={3} />
        {step === 1 && <MetricsStep onNext={handleNext} />}
        {step === 2 && <PhotoStep onNext={handleNext} onSkip={handleSkipPhotos} />}
        {step === 3 && <ModeStep onNext={handleFinish} />}
      </div>
    </div>
  );
}
