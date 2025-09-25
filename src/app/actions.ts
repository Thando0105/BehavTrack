'use server';

import { z } from 'zod';
import { incidents as allIncidents, students } from '@/lib/data';
import type { Incident } from '@/lib/types';
import { generateWeeklyBehaviorSummary } from '@/ai/flows/generate-weekly-behavior-summary';

const actionSchema = z.object({
  studentId: z.string(),
});

export async function getStudentSummary(formData: FormData) {
  try {
    const validatedData = actionSchema.parse({
      studentId: formData.get('studentId'),
    });

    const student = students.find((s) => s.id === validatedData.studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const studentIncidents = allIncidents.filter(
      (i) => i.studentId === validatedData.studentId
    );
    
    // Simulate fetching incidents for the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentIncidents = studentIncidents.filter(i => new Date(i.dateTime) > oneWeekAgo);

    if (recentIncidents.length === 0) {
        return {
            summaryText: "No incidents recorded in the last week.",
            suggestedActions: "Continue to monitor student behavior."
        }
    }


    const summary = await generateWeeklyBehaviorSummary({
      studentId: student.id,
      weekStart: oneWeekAgo.toISOString().split('T')[0],
      incidents: recentIncidents.map(i => ({
        dateTime: i.dateTime,
        severity: i.severity,
        description: i.description
      }))
    });

    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input.', details: error.errors };
    }
    return { error: 'Failed to generate summary.' };
  }
}
