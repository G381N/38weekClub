"use client";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "./icons/logo";

export function Login() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background text-center">
      <Logo className="w-24 h-24 text-accent" />
      <h1 className="text-5xl font-bold text-foreground mt-4 tracking-wider uppercase">
        38 Club
      </h1>
      <p className="text-muted-foreground text-lg mt-2">You are about to be reborn.</p>
      
      <div className="mt-12">
        <Button 
          onClick={signInWithGoogle} 
          disabled={loading}
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 forged-button"
        >
          {loading ? "..." : "Sign In with Google to Begin"}
        </Button>
      </div>

       <p className="text-xs text-muted-foreground/50 mt-12 max-w-sm">
        By signing in, you agree to forge your new self. All progress is tied to your account. There is no turning back.
      </p>
    </div>
  );
}
