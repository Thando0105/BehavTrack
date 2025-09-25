'use server';

/**
 * @fileOverview Generates weekly behavior summaries for students.
 *
 * - generateWeeklyBehaviorSummary - A function that generates weekly summaries of student behavior.
 * - GenerateWeeklyBehaviorSummaryInput - The input type for the generateWeeklyBehaviorSummary function.
 * - GenerateWeeklyBehaviorSummaryOutput - The return type for the generateWeeklyBehaviorSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeeklyBehaviorSummaryInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  weekStart: z.string().describe('The start date of the week (YYYY-MM-DD).'),
  incidents: z.array(
    z.object({
      dateTime: z.string(),
      severity: z.string(),
      description: z.string(),
    })
  ).describe('Array of incidents for the student during the week.'),
});
export type GenerateWeeklyBehaviorSummaryInput = z.infer<typeof GenerateWeeklyBehaviorSummaryInputSchema>;

const GenerateWeeklyBehaviorSummaryOutputSchema = z.object({
  summaryText: z.string().describe('A professional, constructive summary of the student\'s weekly behavior, under 200 words, focusing on trends and possible causes/patterns.'),
  suggestedActions: z.string().describe('A list of suggested interventions based on the behavior summary.'),
});
export type GenerateWeeklyBehaviorSummaryOutput = z.infer<typeof GenerateWeeklyBehaviorSummaryOutputSchema>;

export async function generateWeeklyBehaviorSummary(input: GenerateWeeklyBehaviorSummaryInput): Promise<GenerateWeeklyBehaviorSummaryOutput> {
  return generateWeeklyBehaviorSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyBehaviorSummaryPrompt',
  input: {schema: GenerateWeeklyBehaviorSummaryInputSchema},
  output: {schema: GenerateWeeklyBehaviorSummaryOutputSchema},
  prompt: `You are an expert educational psychologist. Summarize this student's weekly behavior using the logs below for the week starting {{{weekStart}}}.
  Focus on: trends, possible causes/patterns, and suggested interventions.
  Write under 200 words in a professional, constructive tone.

  Incidents:
  {{#each incidents}}
  - Date/Time: {{dateTime}}, Severity: {{severity}}, Description: {{description}}
  {{/each}}

  If there are no incidents, state that the student had a clear week with no behavioral issues logged.
`,
});

const generateWeeklyBehaviorSummaryFlow = ai.defineFlow(
  {
    name: 'generateWeeklyBehaviorSummaryFlow',
    inputSchema: GenerateWeeklyBehaviorSummaryInputSchema,
    outputSchema: GenerateWeeklyBehaviorSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
