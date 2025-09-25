export type UserRole = 'teacher' | 'admin';

export interface User {
  id: string; // This will be the Firestore document ID
  uid: string; // This is the Firebase Auth user ID
  name?: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  classId?: string; // Only for teachers
  status?: 'pending' | 'active'; // Status for teacher onboarding
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  classId: string;
  avatarUrl: string;
  imageHint: string;
}

export type IncidentSeverity = 'low' | 'medium' | 'high';

export interface Incident {
  id: string;
  studentId: string;
  teacherId: string;
  classId: string;
  dateTime: string;
  severity: IncidentSeverity;
  description: string;
}

export interface Summary {
  id: string;
  studentId: string;
  weekStart: string;
  summaryText: string;
  suggestedActions: string;
}
