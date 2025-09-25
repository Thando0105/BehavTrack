
'use server';

import { z } from 'zod';
import { generateWeeklyBehaviorSummary } from '@/ai/flows/generate-weekly-behavior-summary';
import { getFirestore, collection, query, where, getDocs, Timestamp, writeBatch, doc as adminDoc, collectionGroup } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin';
import type { Incident, Student, User } from '@/lib/types';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';

const getStudentSummarySchema = z.object({
  studentId: z.string(),
});

export async function getStudentSummary(formData: FormData) {
  try {
    const validatedData = getStudentSummarySchema.parse({
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

// Data import server action
const incidentImportSchema = z.object({
  StudentName: z.string().min(1),
  Grade: z.string().min(1),
  IncidentDate: z.string().datetime(),
  Severity: z.enum(['low', 'medium', 'high']),
  Description: z.string().min(1),
});

export async function importStudentData(csvData: string) {
    const adminApp = getAdminApp();
    const firestore = getFirestore(adminApp);
    // This is a placeholder for getting the current user. In a real app, you'd get this from the session.
    // For now, we will hardcode a teacher's UID. Replace with actual user session logic.
    const teacherUid = 'dtFSDVAAz6VBzZfKI2y0M8yrzO23'; // FIXME: Replace with actual session user
    
    try {
        const userRecord = await getAdminAuth(adminApp).getUser(teacherUid);
        if (!userRecord) {
            return { error: 'Authentication failed. Could not find user.' };
        }

        const userDocRef = adminDoc(firestore, 'users', userRecord.uid);
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) {
            return { error: 'User profile not found in Firestore.' };
        }

        const userData = userDoc.data() as User;
        const classId = userData.classId;

        if (userData.role !== 'teacher' || !classId) {
            return { error: 'Only teachers with an assigned class can import data.' };
        }

        // Parse CSV
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['StudentName', 'Grade', 'IncidentDate', 'Severity', 'Description'];
        
        if (!requiredHeaders.every(h => headers.includes(h))) {
            return { error: `Missing required headers. Please include: ${requiredHeaders.join(', ')}` };
        }
        
        const rows = lines.slice(1);
        let createdStudents = 0;
        let createdIncidents = 0;

        const batch = writeBatch(firestore);

        for (const line of rows) {
            const values = line.split(',');
            const rowData: any = {};
            headers.forEach((header, index) => {
                rowData[header] = values[index]?.trim();
            });

            const parsed = incidentImportSchema.safeParse(rowData);
            if (!parsed.success) {
                // Skip invalid rows, could add more detailed error reporting
                console.warn('Skipping invalid row:', parsed.error.flatten().fieldErrors);
                continue;
            }
            
            const { StudentName, Grade, IncidentDate, Severity, Description } = parsed.data;

            // Find or create student
            const studentsRef = collection(firestore, 'students');
            const studentQuery = query(studentsRef, where('name', '==', StudentName), where('classId', '==', classId));
            const studentSnap = await studentQuery.get();
            
            let studentId: string;

            if (studentSnap.empty) {
                studentId = uuidv4();
                const newStudentRef = adminDoc(firestore, 'students', studentId);
                const newStudentData: Student = {
                    id: studentId,
                    name: StudentName,
                    grade: Grade,
                    classId: classId,
                    avatarUrl: `https://picsum.photos/seed/${studentId}/100/100`,
                    imageHint: 'person student'
                };
                batch.set(newStudentRef, newStudentData);
                
                // Also add to the nested collection for consistency
                const nestedStudentRef = adminDoc(firestore, `classes/${classId}/students`, studentId);
                batch.set(nestedStudentRef, newStudentData);

                createdStudents++;
            } else {
                studentId = studentSnap.docs[0].id;
            }

            // Create incident
            const incidentId = uuidv4();
            const newIncidentRef = adminDoc(firestore, 'incidents', incidentId);
            const newIncident: Omit<Incident, 'id'> = {
                studentId,
                teacherId: teacherUid,
                classId,
                dateTime: new Date(IncidentDate).toISOString(),
                severity: Severity,
                description: Description,
            };
            batch.set(newIncidentRef, newIncident);
            createdIncidents++;
        }

        await batch.commit();

        return {
            processedRows: rows.length,
            createdStudents,
            createdIncidents,
        };

    } catch (error) {
        console.error('Error importing data:', error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'An unknown error occurred during import.' };
    }
}
