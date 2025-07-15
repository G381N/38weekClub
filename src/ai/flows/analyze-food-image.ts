'use server';

/**
 * @fileOverview Uses the Gemini API to analyze a food image and estimate calories and macros.
 *
 * - analyzeFoodImage - A function that handles the food image analysis process.
 * - AnalyzeFoodImageInput - The input type for the analyzeFoodImage function.
 * - AnalyzeFoodImageOutput - The return type for the analyzeFoodImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFoodImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  notes: z.string().optional().describe('Optional notes about the meal.'),
});
export type AnalyzeFoodImageInput = z.infer<typeof AnalyzeFoodImageInputSchema>;

const AnalyzeFoodImageOutputSchema = z.object({
  calories: z.number().describe('Estimated calories in the meal.'),
  protein: z.number().describe('Estimated protein content in grams.'),
  carbs: z.number().describe('Estimated carbohydrate content in grams.'),
  fat: z.number().describe('Estimated fat content in grams.'),
  summary: z.string().describe('A short summary of the analyzed meal.'),
});
export type AnalyzeFoodImageOutput = z.infer<typeof AnalyzeFoodImageOutputSchema>;

export async function analyzeFoodImage(input: AnalyzeFoodImageInput): Promise<AnalyzeFoodImageOutput> {
  return analyzeFoodImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodImagePrompt',
  input: {schema: AnalyzeFoodImageInputSchema},
  output: {schema: AnalyzeFoodImageOutputSchema},
  prompt: `You are a nutrition expert analyzing a photo of a meal to estimate its nutritional content.

  Analyze the provided image and estimate the calories, protein, carbs, and fat content.
  Provide a short summary of the meal.

  Image: {{media url=photoDataUri}}
  Notes: {{notes}}

  Ensure that the output is in the correct JSON format.
  Remember to estimate even if you are unsure; provide your best guess.
  Make reasonable assumptions, for example assuming that oil was used if you see fried food.
  Give the values as floating point numbers.`,
});

const analyzeFoodImageFlow = ai.defineFlow(
  {
    name: 'analyzeFoodImageFlow',
    inputSchema: AnalyzeFoodImageInputSchema,
    outputSchema: AnalyzeFoodImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
