
"use client";

import React, { useState } from 'react';
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "./icons/logo";
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';

const SignUpForm = ({ onSwitch }: { onSwitch: () => void }) => {
    const { signUpWithEmail, loading, error, setError } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        await signUpWithEmail(email, password);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input id="email-signup" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input id="password-signup" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm-password-signup">Confirm Password</Label>
                <Input id="confirm-password-signup" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full forged-button">
                {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={onSwitch} className="font-semibold text-primary hover:underline">
                    Sign In
                </button>
            </p>
        </form>
    );
};

const SignInForm = ({ onSwitch }: { onSwitch: () => void }) => {
    const { signInWithEmail, loading, error, setError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        await signInWithEmail(email, password);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input id="email-signin" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input id="password-signin" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full forged-button">
                 {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </Button>
             <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button type="button" onClick={onSwitch} className="font-semibold text-primary hover:underline">
                    Sign Up
                </button>
            </p>
        </form>
    );
};


export function Login() {
  const { signInWithGoogle, loading, error, setError } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);

  React.useEffect(() => {
    // Clear errors when switching forms
    setError(null);
  }, [isSigningUp, setError]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background text-center font-headline animate-in fade-in-0 duration-1000">
      <div className="flex flex-col items-center mb-8">
        <Logo className="w-24 h-24 text-accent" />
        <h1 className="text-5xl font-bold text-foreground mt-4 tracking-wider uppercase">
          38 Club
        </h1>
        <p className="text-muted-foreground text-lg mt-2">You are about to be reborn.</p>
      </div>
      
      <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle>{isSigningUp ? 'Join the Club' : 'Welcome Back'}</CardTitle>
            <CardDescription>{isSigningUp ? 'Create your account to begin the journey.' : 'Sign in to continue your transformation.'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isSigningUp ? <SignUpForm onSwitch={() => setIsSigningUp(false)} /> : <SignInForm onSwitch={() => setIsSigningUp(true)} />}

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <Button 
              onClick={signInWithGoogle} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In with Google'}
            </Button>
        </CardContent>
      </Card>
      
       <p className="text-xs text-muted-foreground/50 mt-8 max-w-sm">
        By signing in, you agree to forge your new self. All progress is tied to your account. There is no turning back.
      </p>
    </div>
  );
}
