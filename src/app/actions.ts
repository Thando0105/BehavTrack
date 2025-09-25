
'use server';

import { z } from 'zod';
import { generateWeeklyBehaviorSummary } from '@/ai/flows/generate-weekly-behavior-summary';
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin';
import type { Incident } from '@/lib/types';


const actionSchema = z.object({
  studentId: z.string(),
});

export async function getStudentSummary(formData: FormData) {
  try {
    const validatedData = actionSchema.parse({
      studentId: formData.get('studentId'),
    });

    const adminApp = getAdminApp();
    const firestore = getFirestore(adminApp);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const incidentsRef = collection(firestore, 'incidents');
    const q = query(incidentsRef, 
        where('studentId', '==', validatedData.studentId),
        where('dateTime', '>=', oneWeekAgo.toISOString())
    );

    const querySnapshot = await getDocs(q);
    const recentIncidents: Incident[] = [];
    querySnapshot.forEach((doc) => {
        recentIncidents.push({ id: doc.id, ...doc.data() } as Incident);
    });

    if (recentIncidents.length === 0) {
        return {
            summaryText: "No incidents recorded in the last week.",
            suggestedActions: "Continue to monitor student behavior and reinforce positive actions."
        }
    }

    const summary = await generateWeeklyBehaviorSummary({
      studentId: validatedData.studentId,
      weekStart: oneWeekAgo.toISOString().split('T')[0],
      incidents: recentIncidents.map(i => ({
        dateTime: i.dateTime,
        severity: i.severity,
        description: i.description
      }))
    });

    // TODO: Save summary to 'summaries' collection
    
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input.', details: error.errors };
    }
    // Check if error is an object with a message property
    if (error && typeof error === 'object' && 'message' in error) {
      return { error: `Failed to generate summary: ${error.message}` };
    }
    return { error: 'An unknown error occurred while generating the summary.' };
  }
}
