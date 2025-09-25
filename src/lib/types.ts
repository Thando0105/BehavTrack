export type UserRole = 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
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
