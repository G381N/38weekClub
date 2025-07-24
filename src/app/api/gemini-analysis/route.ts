import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { WorkoutHistory, WorkoutDayType, WeeklyWorkoutData, UserMetrics } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { workoutHistory, dayType, exerciseName, userGoals, userMetrics, fullDay } = await req.json();
    if (!workoutHistory || !dayType) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const weeks: WeeklyWorkoutData[] = (workoutHistory[dayType as WorkoutDayType] || []).slice(0, 3);

    // Build the prompt as before
    let prompt = '';
    if (fullDay) {
      const allExercises = (weeks[0]?.exercises ?? []).map(e => e.name);
      const exerciseHistories = allExercises.map(name => ({
        name,
        history: weeks.map(week => {
          const ex = (week.exercises ?? []).find(e => e.name === name);
          return {
            weekNumber: week.weekNumber,
            startDate: week.startDate,
            sets: ex ? ex.sets : [],
          };
        })
      }));
      const hasData = exerciseHistories.some(ex => ex.history.some(week => week.sets && week.sets.length > 0));
      if (!hasData) {
        return NextResponse.json({ error: 'Not enough data for analysis. Log at least one week of sets.' }, { status: 400 });
      }
      prompt = `You are an expert strength coach specializing in high-volume training. Analyze the workout data for multiple exercises over the last 3 weeks.

User Data: ${JSON.stringify(exerciseHistories)}
User Goals: ${userGoals}
User Metrics: ${JSON.stringify(userMetrics)}

This user prefers high-rep training with supersets and burnout techniques. For each exercise, provide SPECIFIC recommendations:

1. Mental Barrier: Where they typically stop due to mental limitations (use 10-30 rep range)
2. True Potential: Maximum weight they can achieve with proper coaching (use 8-15 rep range for strength focus)
3. Recommended Plan: 4 progressive sets + 1 failure set for maximum burnout
4. Failure Set: A final burnout set with reduced weight to complete muscle exhaustion

IMPORTANT: Analyze the actual user data for each exercise and respond with ONLY valid JSON in this exact format:
[
  {
    "name": "[actual_exercise_name]",
    "mentalFailureRep": "[calculated_weight]kg x [calculated_reps] reps",
    "trueRep": "[heavier_calculated_weight]kg x [8-15_calculated_reps] reps",
    "recommendedPlan": [
      {"set": 1, "weight": [calculated_weight], "reps": [calculated_reps], "note": "Warm-up set"},
      {"set": 2, "weight": [calculated_weight], "reps": [calculated_reps], "note": "Build intensity"},
      {"set": 3, "weight": [calculated_weight], "reps": [calculated_reps], "note": "Working weight"}, 
      {"set": 4, "weight": [calculated_weight], "reps": [calculated_reps], "note": "Peak intensity"}
    ],
    "failureSet": {"weight": [reduced_calculated_weight], "reps": "to failure", "note": "Drop weight, push to complete muscle failure for maximum burn"},
    "explanation": "Professional analysis based on actual progression data with scientific reasoning for this specific exercise."
  }
]`;
    } else {
      if (!exerciseName) {
        return NextResponse.json({ error: 'Missing exerciseName for per-exercise analysis.' }, { status: 400 });
      }
      const exerciseHistory = weeks.map(week => {
        const ex = (week.exercises ?? []).find(e => e.name === exerciseName);
        return {
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          sets: ex ? ex.sets : [],
        };
      });
      const hasData = exerciseHistory.some(week => week.sets && week.sets.length > 0);
      if (!hasData) {
        return NextResponse.json({ error: 'Not enough data for analysis. Log at least one week of sets.' }, { status: 400 });
      }
      prompt = `You are an expert strength coach specializing in high-volume training. Analyze the workout data for '${exerciseName}' over the last 3 weeks.

User Data: ${JSON.stringify(exerciseHistory)}
User Goals: ${userGoals}
User Metrics: ${JSON.stringify(userMetrics)}

This user prefers high-rep training with supersets and burnout techniques. Provide SPECIFIC recommendations:

1. Mental Barrier: Where they typically stop due to mental limitations (use 10-30 rep range)
2. True Potential: Maximum weight they can achieve with proper coaching (use 8-15 rep range for strength focus)
3. Recommended Plan: 4 progressive sets + 1 failure set for maximum burnout
4. Failure Set: A final burnout set with reduced weight to complete muscle exhaustion

IMPORTANT: Analyze the actual user data and respond with ONLY valid JSON in this exact format:
{
  "mentalFailureRep": "[weight]kg x [reps] reps",
  "trueRep": "[heavier_weight]kg x [8-15_reps] reps", 
  "recommendedPlan": [
    {"set": 1, "weight": [calculated_weight], "reps": [calculated_reps], "note": "Warm-up set"},
    {"set": 2, "weight": [calculated_weight], "reps": [calculated_reps], "note": "Build intensity"}, 
    {"set": 3, "weight": [calculated_weight], "reps": [calculated_reps], "note": "Working weight"},
    {"set": 4, "weight": [calculated_weight], "reps": [calculated_reps], "note": "Peak intensity"}
  ],
  "failureSet": {"weight": [reduced_weight], "reps": "to failure", "note": "Drop weight, push to complete muscle failure for maximum burn"},
  "explanation": "Professional analysis based on your actual progression data, identifying specific mental barriers and true strength potential with scientific reasoning."
}`;
    }
    // Use direct fetch logic as in the test endpoint
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not set in environment.' }, { status: 500 });
    }
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      }),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 