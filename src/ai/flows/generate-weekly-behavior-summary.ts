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
  summaryText: z.string().describe('A summary of the student\'s behavior for the week.'),
  suggestedActions: z.string().describe('Recommended interventions or actions based on the summary.'),
});
export type GenerateWeeklyBehaviorSummaryOutput = z.infer<typeof GenerateWeeklyBehaviorSummaryOutputSchema>;

export async function generateWeeklyBehaviorSummary(input: GenerateWeeklyBehaviorSummaryInput): Promise<GenerateWeeklyBehaviorSummaryOutput> {
  return generateWeeklyBehaviorSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyBehaviorSummaryPrompt',
  input: {schema: GenerateWeeklyBehaviorSummaryInputSchema},
  output: {schema: GenerateWeeklyBehaviorSummaryOutputSchema},
  prompt: `You are an AI assistant helping teachers understand student behavior.
  Given the following incidents for student ID {{{studentId}}} during the week starting {{{weekStart}}}, generate a summary of the student\'s behavior, highlighting trends and patterns.
  Also, suggest possible actions or interventions that the teacher could take.

  Incidents:
  {{#each incidents}}
  - Date/Time: {{dateTime}}, Severity: {{severity}}, Description: {{description}}
  {{/each}}

  Summary should be concise but informative. Suggested actions should be practical and actionable.
  Ensure that the summary and suggested actions are tailored to the specific incidents provided.
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
