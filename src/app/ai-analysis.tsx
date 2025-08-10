"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { workoutCategories, exercises as allExercises } from '@/lib/data';
import { WorkoutDayType } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  AlertTriangle, 
  Loader2, 
  BarChart3,
  Flame,
  Shield,
  Trophy,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getExerciseTips } from '@/lib/exercise-tips';

const dayTypeLabels: Record<WorkoutDayType, string> = {
  chest_biceps: 'Chest & Biceps',
  back_triceps: 'Back & Triceps',
  shoulders: 'Shoulders',
  legs: 'Legs',
};

const dayTypeToCategoryId: Record<WorkoutDayType, string> = {
  chest_biceps: 'day1',
  back_triceps: 'day2',
  shoulders: 'day3',
  legs: 'day4',
};

const dayTypeColors: Record<WorkoutDayType, string> = {
  chest_biceps: 'bg-red-500/20 text-red-400 border-red-500/30',
  back_triceps: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shoulders: 'bg-green-500/20 text-green-400 border-green-500/30',
  legs: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

interface AIAnalysisResult {
  mentalFailureRep: string;
  trueRep: string;
  recommendedPlan: Array<{ set: number; weight: number; reps: number; note?: string }>;
  failureSet?: { weight: number; reps: string; note?: string };
  explanation: string;
}

const LoadingCard = ({ exercise }: { exercise: string }) => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="h-8 bg-muted rounded w-20"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    </CardContent>
  </Card>
);

const AIResultCard = ({ exercise, result, personalBest }: { exercise: string; result: AIAnalysisResult; personalBest?: { weight: number; reps: number; date?: string } }) => {
  const formTips = getExerciseTips(exercise);
  const [planExpanded, setPlanExpanded] = useState(false);
  const [analysisExpanded, setAnalysisExpanded] = useState(false);
  const [formExpanded, setFormExpanded] = useState(false);
  
  return (
  <Card className="border-accent/20 bg-gradient-to-br from-card to-card/50">
    <Collapsible open={planExpanded} onOpenChange={setPlanExpanded}>
      <CollapsibleTrigger asChild>
        <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-accent" />
            {exercise}
            <Badge variant="secondary" className="ml-auto mr-2">
              <Trophy className="w-3 h-3 mr-1" />
              Analyzed
            </Badge>
            {planExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </CardTitle>
          <CardDescription>
            Mental Barrier: {result.mentalFailureRep} • True Potential: {result.trueRep}
          </CardDescription>
        </CardHeader>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="space-y-6">
      {/* Personal Best */}
      {personalBest && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-yellow-400">Personal Best</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-yellow-400">
              {personalBest.weight}kg × {personalBest.reps} reps
            </span>
            {personalBest.date && (
              <span className="text-xs text-muted-foreground">
                {new Date(personalBest.date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Mental vs True Potential */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-amber-400">Mental Barrier</span>
          </div>
          <p className="text-sm text-muted-foreground">{result.mentalFailureRep}</p>
        </div>
        
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-emerald-400">True Potential</span>
          </div>
          <p className="text-sm text-muted-foreground">{result.trueRep}</p>
        </div>
      </div>

      <Separator />

      {/* Recommended Plan */}
      <Collapsible open={planExpanded} onOpenChange={setPlanExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer rounded-lg p-2 sm:p-3 transition-colors">
            <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-primary text-base sm:text-lg">Recommended Workout Plan</h4>
            </div>
            {planExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
        </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-2 mt-2">
        {result.recommendedPlan && result.recommendedPlan.length > 0 ? (
              result.recommendedPlan.map((set, i) => (
                <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Set {i + 1}</span>
                    {set.note && <span className="text-xs text-muted-foreground">{set.note}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="text-accent font-bold">{set.weight}kg</div>
                  <div className="text-muted-foreground">×</div>
                    <div className="text-accent font-bold">{set.reps} reps</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No specific plan provided</p>
            )}
            {result.failureSet && (
              <div className="mt-2 p-2 sm:p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-destructive">Failure Set</span>
                      {result.failureSet.note && (
                        <span className="text-xs text-muted-foreground">{result.failureSet.note}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-destructive font-bold">{result.failureSet.weight}kg</div>
                    <div className="text-muted-foreground">×</div>
                    <div className="text-destructive font-bold">{result.failureSet.reps}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Analysis Explanation */}
      <Collapsible open={analysisExpanded} onOpenChange={setAnalysisExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 mb-3 cursor-pointer hover:bg-accent/5 transition-colors rounded-lg p-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h4 className="font-semibold text-blue-400">AI Analysis</h4>
            {analysisExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
        </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.explanation}
          </p>
        </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Form Tips */}
      {formTips && (
        <Collapsible open={formExpanded} onOpenChange={setFormExpanded}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 mb-3 cursor-pointer hover:bg-accent/5 transition-colors rounded-lg p-3">
            <Shield className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-green-400">Perfect Form Guide</h4>
              {formExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
          </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <h5 className="font-medium text-green-400 mb-1">Setup</h5>
              <p className="text-sm text-muted-foreground">{formTips.setup}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <h5 className="font-medium text-blue-400 mb-1">Execution</h5>
              <p className="text-sm text-muted-foreground">{formTips.execution}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <h5 className="font-medium text-purple-400 mb-1">Breathing</h5>
              <p className="text-sm text-muted-foreground">{formTips.breathing}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <h5 className="font-medium text-red-400 mb-1">Avoid These Mistakes</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                {formTips.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </CollapsibleContent>
        </Collapsible>
      )}
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  </Card>
  );
};

export default function AIAnalysisPage() {
  const { userId, userMetrics } = useAppStore();
  const [selectedDay, setSelectedDay] = useState<WorkoutDayType | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, AIAnalysisResult>>({});
  const [personalBests, setPersonalBests] = useState<Record<string, { weight: number; reps: number; date?: string }>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDayClick = (day: WorkoutDayType) => {
    setSelectedDay(day);
    setAiResults({});
    setPersonalBests({});
    setError(null);
  };

  const fetchAndAnalyze = async (variation: string) => {
    if (!userId || !selectedDay) {
      toast({
        title: "Error",
        description: "Please log in and select a workout day",
        variant: "destructive"
      });
      return;
    }

    setLoading(variation);
    setError(null);
    
    try {
      const varKey = variation.replace(/[\s\/]+/g, '_');
      
      // Fetch personal best
      const pbRef = doc(db, 'users', userId, 'workouts', varKey, 'meta', 'personal_best');
      const pbSnap = await getDoc(pbRef);
      if (pbSnap.exists()) {
        const pbData = pbSnap.data();
        setPersonalBests(prev => ({ 
          ...prev, 
          [variation]: { 
            weight: pbData.weight, 
            reps: pbData.reps, 
            date: pbData.timestamp 
          } 
        }));
      }
      
      // Fetch workout weeks data
      const weeksCol = collection(db, 'users', userId, 'workouts', varKey, 'weeks');
      const weekDocs = await getDocs(weeksCol);
      
      const weekData: {
        weekNumber: number;
        startDate: string;
        exercises: { name: string; sets: { reps: number; weight: number; timestamp: string }[] }[];
      }[] = [];
      weekDocs.forEach(docSnap => {
        const data = docSnap.data();
        weekData.push({ 
          weekNumber: data.week, 
          startDate: data.startDate, 
          exercises: [{ name: variation, sets: data.sets || [] }]
        });
      });

      if (weekData.length === 0) {
        toast({
          title: "No Data Found",
          description: `No workout data found for ${variation}. Start logging workouts first.`,
          variant: "destructive"
        });
        setLoading(null);
        return;
      }

      weekData.sort((a, b) => b.weekNumber - a.weekNumber);
      const last3Weeks = weekData.slice(0, 3);

      const res = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutHistory: { [selectedDay]: last3Weeks },
          dayType: selectedDay,
          exerciseName: variation,
          userGoals: 'Maximize strength and muscle growth while avoiding overtraining',
          userMetrics: userMetrics || {},
          fullDay: false,
        }),
      });

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Extract AI response from Gemini API response
      let aiResponse;
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const rawText = data.candidates[0].content.parts[0].text;
        console.log('Raw AI response:', rawText); // Debug log
        
        try {
          // First try to parse as direct JSON
          aiResponse = JSON.parse(rawText);
        } catch {
          // If that fails, try to extract JSON from markdown code blocks
          const jsonMatch = rawText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (jsonMatch) {
            try {
              aiResponse = JSON.parse(jsonMatch[1]);
            } catch {
              aiResponse = null;
            }
          }
          
          // If no markdown, try to find JSON after "json" keyword or within quotes
          if (!aiResponse) {
            // Handle case where AI returns: "json { ... }"
            const quotedJsonMatch = rawText.match(/["`'](?:json\s*)?(\{[\s\S]*\})["`']/i);
            if (quotedJsonMatch) {
              try {
                aiResponse = JSON.parse(quotedJsonMatch[1]);
              } catch {
                aiResponse = null;
              }
            }
            
            // Handle case where AI returns: json { ... }
            if (!aiResponse) {
              const jsonAfterKeyword = rawText.match(/(?:json\s*)?(\{[\s\S]*\})/i);
              if (jsonAfterKeyword) {
                try {
                  aiResponse = JSON.parse(jsonAfterKeyword[1]);
                } catch {
                  aiResponse = null;
                }
              }
            }
          }
          
          // Try to find any JSON-like structure in the text
          if (!aiResponse) {
            const jsonRegex = /\{[\s\S]*\}/;
            const jsonLikeMatch = rawText.match(jsonRegex);
            if (jsonLikeMatch) {
              try {
                aiResponse = JSON.parse(jsonLikeMatch[0]);
              } catch {
                aiResponse = null;
              }
            }
          }
          
          // If all parsing fails, create structured response from raw text
          if (!aiResponse) {
            aiResponse = {
              mentalFailureRep: "Analysis shows mental barriers exist",
              trueRep: "True potential identified", 
              recommendedPlan: [],
              explanation: rawText
            };
          }
        }
        
        console.log('Parsed AI response:', aiResponse); // Debug log
      } else {
        throw new Error('Invalid response format from AI');
      }

      setAiResults(prev => ({ ...prev, [variation]: aiResponse }));
      
      toast({
        title: "Analysis Complete",
        description: `AI analysis for ${variation} has been generated`,
      });

    } catch (e: unknown) {
      const errorMessage = (e as Error).message || 'Failed to fetch AI analysis.';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const selectedExercises = selectedDay 
    ? allExercises[dayTypeToCategoryId[selectedDay] as keyof typeof allExercises] || []
    : [];

  return (
    <div className="p-2 sm:p-4 space-y-6 animate-in fade-in-0 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground uppercase tracking-wider">
          AI Workout Analysis
        </h1>
        <p className="text-muted-foreground">
          Get personalized insights to push beyond your mental barriers
        </p>
      </div>

      {/* Day Selection */}
      <Card className="p-2 sm:p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Select Workout Day
          </CardTitle>
          <CardDescription>
            Choose which workout day you want to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(dayTypeLabels).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedDay === key ? "default" : "outline"}
                className={`h-auto p-4 justify-start ${
                  selectedDay === key 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent/10'
                }`}
                onClick={() => handleDayClick(key as WorkoutDayType)}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-semibold md:group-hover:text-accent">{label}</span>
                  <Badge 
                    variant="secondary" 
                    className={selectedDay === key ? '' : dayTypeColors[key as WorkoutDayType]}
                  >
                    {key.replace('_', ' ')}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Analysis */}
      {selectedDay && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold">
              {dayTypeLabels[selectedDay]} Analysis
            </h2>
          </div>

          <ScrollArea className="h-auto p-2 sm:p-4">
            <div className="space-y-4">
              {selectedExercises.map((exercise: string) => (
                <div key={exercise}>
                  {loading === exercise ? (
                    <LoadingCard exercise={exercise} />
                  ) : aiResults[exercise] ? (
                    <AIResultCard 
                      exercise={exercise} 
                      result={aiResults[exercise]} 
                      personalBest={personalBests[exercise]}
                    />
                  ) : (
                    <Card className="hover:shadow-lg transition-all duration-200 p-2 sm:p-4 w-full max-w-full">
                      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-muted-foreground" />
                          <h4 className="font-semibold text-base sm:text-lg">
                            {exercise}
                          </h4>
                        </div>
                          <Button 
                            onClick={() => fetchAndAnalyze(exercise)}
                            disabled={loading === exercise}
                            className="forged-button"
                          >
                            {loading === exercise ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4 mr-2" />
                                Generate Analysis
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </>
                            )}
                          </Button>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm">
                          Get AI-powered insights to break through plateaus and optimize your performance
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5 p-2 sm:p-4 w-full max-w-full">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Analysis Error</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedDay && (
        <Card className="text-center py-12 p-2 sm:p-4 w-full max-w-full">
          <CardContent>
            <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready for AI Analysis</h3>
            <p className="text-muted-foreground">
              Select a workout day above to get started with personalized insights
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 