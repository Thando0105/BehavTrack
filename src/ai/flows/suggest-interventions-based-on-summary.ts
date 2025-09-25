'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests interventions based on a student's behavior summary.
 *
 * - suggestInterventions - An async function that takes a student behavior summary as input and returns suggested interventions.
 * - SuggestInterventionsInput - The input type for the suggestInterventions function.
 * - SuggestInterventionsOutput - The return type for the suggestInterventions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestInterventionsInputSchema = z.object({
  behaviorSummary: z
    .string()
    .describe("A summary of a student's behavior, including trends and patterns."),
});
export type SuggestInterventionsInput = z.infer<typeof SuggestInterventionsInputSchema>;

const SuggestInterventionsOutputSchema = z.object({
  suggestedInterventions: z
    .string()
    .describe("A list of suggested interventions based on the behavior summary."),
});
export type SuggestInterventionsOutput = z.infer<typeof SuggestInterventionsOutputSchema>;

export async function suggestInterventions(input: SuggestInterventionsInput): Promise<SuggestInterventionsOutput> {
  return suggestInterventionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestInterventionsPrompt',
  input: {schema: SuggestInterventionsInputSchema},
  output: {schema: SuggestInterventionsOutputSchema},
  prompt: `You are an experienced educator specializing in student behavior management.
Given the following summary of a student's behavior, suggest a list of potential interventions.

Behavior Summary:
{{behaviorSummary}}

Suggested Interventions:`,
});

const suggestInterventionsFlow = ai.defineFlow(
  {
    name: 'suggestInterventionsFlow',
    inputSchema: SuggestInterventionsInputSchema,
    outputSchema: SuggestInterventionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
