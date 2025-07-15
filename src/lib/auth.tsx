
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { app } from './firebase';
import type {AuthError} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email:string, password:string) => Promise<User | null>;
  signInWithEmail: (email:string, password:string) => Promise<User | null>;
  signOut: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setError(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      const authError = error as AuthError;
      setError(authError.message);
    } finally {
      // Auth state change will handle setting loading to false
    }
  };

  const signUpWithEmail = async (email:string, password:string): Promise<User | null> => {
      setLoading(true);
      setError(null);
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          setError(`An account already exists with this email. Please sign in or use a different provider.`);
          setLoading(false);
          return null;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error) {
        console.error("Error signing up: ", error);
        const authError = error as AuthError;
        setError(authError.message);
        return null;
      } finally {
        setLoading(false);
      }
  };

  const signInWithEmail = async (email:string, password:string): Promise<User | null> => {
      setLoading(true);
      setError(null);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error) {
        console.error("Error signing in: ", error);
        const authError = error as AuthError;
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
            setError('Invalid email or password. Please try again.');
        } else {
            setError(authError.message);
        }
        return null;
      } finally {
        setLoading(false);
      }
  };


  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await auth.signOut();
    } catch(error) {
        console.error("Error signing out: ", error)
        const authError = error as AuthError;
        setError(authError.message);
    } finally {
        // Auth state change will handle setting loading to false
    }
  };

  const value = { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut, error, setError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
