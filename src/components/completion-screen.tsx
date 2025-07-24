"use client";

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useAppStore } from '@/lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Camera, Download, Share2 } from 'lucide-react';
import { Logo } from './icons/logo';

const Certificate = React.forwardRef<HTMLDivElement>((props, ref) => {
    const { disciplineMode } = useAppStore(state => ({
        disciplineMode: state.disciplineMode
    }));
    
    return (
        <div ref={ref} className="bg-background border-2 border-accent p-8 rounded-lg shadow-2xl shadow-primary/20 w-full max-w-lg aspect-[3/4] flex flex-col justify-between items-center text-center text-foreground">
            <div>
                <h1 className="text-3xl font-bold text-accent font-headline tracking-wider">You have been recognized.</h1>
                <p className="mt-2 text-muted-foreground">38 Weeks of Discipline. You’ve been reborn.</p>
            </div>
            <Logo className="w-32 h-32 my-8 animate-pulse" />
            <div className="w-full">
                <div className="flex justify-between text-sm border-t border-border pt-4">
                    <div className="text-left">
                        <p className="text-muted-foreground">Completion Date</p>
                        <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground">Mode</p>
                        <p className="font-semibold capitalize">{disciplineMode}</p>
                    </div>
                </div>
            </div>
        </div>
    );
});
Certificate.displayName = 'Certificate';

const PhotoStep = ({ onNext }: { onNext: () => void }) => (
    <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera /> The Final Record</CardTitle>
            <CardDescription>The journey is complete. Document the result.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
            {['Front', 'Back', 'Side', 'Flex'].map(label => (
                <div key={label} className="flex items-center justify-center p-4 h-24 bg-muted rounded-md text-muted-foreground">
                    {label}
                </div>
            ))}
             <p className="text-xs text-muted-foreground col-span-2">Photo uploads are disabled in this demo.</p>
        </CardContent>
        <CardFooter>
            <Button onClick={onNext} className="w-full">Next</Button>
        </CardFooter>
    </Card>
);

export function CompletionScreen() {
    const [step, setStep] = useState(1);
    const certificateRef = useRef<HTMLDivElement>(null);

    const handleSave = () => {
        if (certificateRef.current) {
            html2canvas(certificateRef.current, { backgroundColor: '#1A1A1A' }).then(canvas => {
                const link = document.createElement('a');
                link.download = '38-club-certificate.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };
    
    const handleShare = async () => {
        if(navigator.share){
            try {
                await navigator.share({
                    title: '38 Club: Reborn',
                    text: '38 weeks of discipline. I have been reborn.',
                });
            } catch (error) {
                console.error("Share failed:", error);
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background animate-in fade-in-0 duration-1000">
            {step === 1 ? (
                <PhotoStep onNext={() => setStep(2)} />
            ) : (
                <div className="flex flex-col items-center gap-8">
                    <Certificate ref={certificateRef} />
                    <div className="flex gap-4">
                        <Button onClick={handleSave}><Download className="mr-2 h-4 w-4" /> Save Certificate</Button>
                        <Button onClick={handleShare} variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
