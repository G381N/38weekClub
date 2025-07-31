import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { WorkoutHistory, WorkoutDayType, WeeklyWorkoutData, UserMetrics } from '@/lib/types';

export const runtime = 'nodejs';

// Fallback regex parser for common workout phrases
function parseWorkoutWithRegex(transcript: string) {
  const exercises = [];
  const exercisePatterns = [
    /(?:bench|bench press|flat bench|incline bench|chest press)/gi,
    /(?:squat|leg press|leg extension)/gi,
    /(?:deadlift|romanian deadlift)/gi,
    /(?:curl|bicep curl|hammer curl|preacher curl)/gi,
    /(?:press|shoulder press|overhead press)/gi,
    /(?:row|lat pulldown|seated row)/gi,
    /(?:fly|chest fly|dumbbell fly)/gi,
    /(?:extension|tricep extension|skull crusher)/gi,
    /(?:lateral raise|side raise)/gi,
    /(?:shrug|trap shrug)/gi,
  ];

  // Extract numbers (weight and reps)
  const numberPattern = /(\d+(?:\.\d+)?)\s*(?:kg|kgs|pound|pounds|lb|lbs|reps?|rep|lap|laps|times?|time)/gi;
  const numbers = [];
  let match;
  while ((match = numberPattern.exec(transcript)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[0].toLowerCase();
    if (unit.includes('kg') || unit.includes('pound') || unit.includes('lb')) {
      numbers.push({ type: 'weight', value: unit.includes('kg') ? value : value * 0.453592 });
    } else {
      numbers.push({ type: 'reps', value });
    }
  }

  // Find exercises mentioned
  const foundExercises = [];
  for (const pattern of exercisePatterns) {
    const matches = transcript.match(pattern);
    if (matches) {
      foundExercises.push(matches[0].toLowerCase());
    }
  }

  // Group by exercise and create sets
  if (foundExercises.length > 0 && numbers.length >= 2) {
    const weights = numbers.filter(n => n.type === 'weight').map(n => n.value);
    const reps = numbers.filter(n => n.type === 'reps').map(n => n.value);
    
    // Map common phrases to exercise names
    const exerciseMap: Record<string, string> = {
      'bench': 'Flat Barbell Bench Press',
      'bench press': 'Flat Barbell Bench Press',
      'flat bench': 'Flat Barbell Bench Press',
      'incline bench': 'Incline Barbell Press',
      'chest press': 'Chest Press Machine',
      'fly': 'Chest Flies',
      'chest fly': 'Chest Flies',
      'dumbbell fly': 'Chest Flies',
      'curl': 'Barbell Curls (Straight Bar)',
      'bicep curl': 'Barbell Curls (Straight Bar)',
      'hammer curl': 'Hammer Curls',
      'preacher curl': 'Preacher Curls',
      'press': 'Shoulder Press (Traditional Grip)',
      'shoulder press': 'Shoulder Press (Traditional Grip)',
      'overhead press': 'Shoulder Press (Traditional Grip)',
      'row': 'Seated Rows',
      'lat pulldown': 'Wide-Grip Lat Pulldown',
      'seated row': 'Seated Rows',
      'extension': 'Tricep Pushdowns',
      'tricep extension': 'Tricep Pushdowns',
      'skull crusher': 'Skull Crushers (EZ Bar)',
      'lateral raise': 'Lateral Raises',
      'side raise': 'Lateral Raises',
      'shrug': 'Shrugs',
      'trap shrug': 'Shrugs',
    };

    for (let i = 0; i < Math.min(weights.length, reps.length); i++) {
      const exerciseName = exerciseMap[foundExercises[0]] || foundExercises[0];
      exercises.push({
        name: exerciseName,
        weight: weights[i],
        reps: reps[i]
      });
    }
  }

  return exercises;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Handle voice transcript parsing
    if (body.voiceTranscript && body.action === 'parse_workout_log') {
      const transcript = body.voiceTranscript.toLowerCase();
      
      // Try Gemini AI first
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY not set in environment.' }, { status: 500 });
      }

      const voicePrompt = `You are a workout log parser. Extract all sets from the following voice transcript. For each set, return the exercise name, weight (in kg), and reps. 

Accept variations like "laps", "reps", "for", "kgs", "pounds", etc. Handle natural speech patterns.

Common exercise variations to recognize:
- "bench", "bench press", "flat bench" → "Flat Barbell Bench Press"
- "incline bench" → "Incline Barbell Press" 
- "chest press" → "Chest Press Machine"
- "fly", "chest fly" → "Chest Flies"
- "curl", "bicep curl" → "Barbell Curls (Straight Bar)"
- "hammer curl" → "Hammer Curls"
- "preacher curl" → "Preacher Curls"
- "press", "shoulder press" → "Shoulder Press (Traditional Grip)"
- "row", "lat pulldown" → "Wide-Grip Lat Pulldown"
- "extension", "tricep extension" → "Tricep Pushdowns"

Voice transcript: "${transcript}"

Output ONLY valid JSON array in this format:
[{"name": "exercise_name", "weight": number, "reps": number}]

Example input: "I just did set of bench press for 15 kgs for 15 laps"
Example output: [{"name": "Flat Barbell Bench Press", "weight": 15, "reps": 15}]`;

      try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: voicePrompt }] }]
          }),
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const aiResponse = data.candidates[0].content.parts[0].text;
          
          try {
            // Try to parse AI response
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return NextResponse.json({ exercises: parsed });
              }
            }
          } catch (e) {
            console.log('AI parsing failed, trying regex fallback');
          }
        }
      } catch (e) {
        console.log('Gemini API failed, using regex fallback');
      }

      // Fallback to regex parsing
      const regexResults = parseWorkoutWithRegex(transcript);
      if (regexResults.length > 0) {
        return NextResponse.json({ exercises: regexResults });
      }

      return NextResponse.json({ 
        exercises: [],
        error: 'Could not parse workout data. Try saying: "bench 40kg 15 reps"'
      });
    }

    // Original workout analysis logic
    const { workoutHistory, dayType, exerciseName, userGoals, userMetrics, fullDay } = body;
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