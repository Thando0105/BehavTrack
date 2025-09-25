import type { Student, Incident, User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageUrl ?? 'https://picsum.photos/seed/error/100/100';
const getImageHint = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageHint ?? 'person';


export const students: Student[] = [
  { id: '1', name: 'Liam Johnson', grade: '4', classId: 'C101', avatarUrl: getImage('student-1'), imageHint: getImageHint('student-1') },
  { id: '2', name: 'Olivia Smith', grade: '4', classId: 'C101', avatarUrl: getImage('student-2'), imageHint: getImageHint('student-2') },
  { id: '3', name: 'Noah Williams', grade: '4', classId: 'C101', avatarUrl: getImage('student-3'), imageHint: getImageHint('student-3') },
  { id: '4', name: 'Emma Brown', grade: '4', classId: 'C101', avatarUrl: getImage('student-4'), imageHint: getImageHint('student-4') },
  { id: '5', name: 'Oliver Jones', grade: '5', classId: 'C102', avatarUrl: getImage('student-5'), imageHint: getImageHint('student-5') },
  { id: '6', name: 'Ava Garcia', grade: '5', classId: 'C102', avatarUrl: getImage('student-6'), imageHint: getImageHint('student-6') },
  { id: '7', name: 'Elijah Miller', grade: '5', classId: 'C102', avatarUrl: getImage('student-7'), imageHint: getImageHint('student-7') },
  { id: '8', name: 'Charlotte Davis', grade: '5', classId: 'C102', avatarUrl: getImage('student-8'), imageHint: getImageHint('student-8') },
];

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const incidents: Incident[] = [
  { id: 'inc-1', studentId: '1', teacherId: 't-1', dateTime: daysAgo(2), severity: 'low', description: 'Disrupted class by talking during lesson.' },
  { id: 'inc-2', studentId: '1', teacherId: 't-1', dateTime: daysAgo(4), severity: 'medium', description: 'Refused to complete assignment.' },
  { id: 'inc-3', studentId: '2', teacherId: 't-1', dateTime: daysAgo(1), severity: 'low', description: 'Helped another student who was struggling.' },
  { id: 'inc-4', studentId: '3', teacherId: 't-1', dateTime: daysAgo(5), severity: 'high', description: 'Argument with a classmate that required intervention.' },
  { id: 'inc-5', studentId: '3', teacherId: 't-1', dateTime: daysAgo(3), severity: 'medium', description: 'Was not in his seat and distracted others.' },
  { id: 'inc-6', studentId: '4', teacherId: 't-1', dateTime: daysAgo(2), severity: 'low', description: 'Submitted homework late.' },
  { id: 'inc-7', studentId: '1', teacherId: 't-1', dateTime: daysAgo(1), severity: 'low', description: 'Was drawing in notebook instead of taking notes.' },
  { id: 'inc-8', studentId: '5', teacherId: 't-2', dateTime: daysAgo(1), severity: 'medium', description: 'Used phone during class time.' },
  { id: 'inc-9', studentId: '6', teacherId: 't-2', dateTime: daysAgo(3), severity: 'low', description: 'Arrived late to class.' },
  { id: 'inc-10', studentId: '7', teacherId: 't-2', dateTime: daysAgo(4), severity: 'high', description: 'Cheating on a quiz.' },
  { id: 'inc-11', studentId: '8', teacherId: 't-2', dateTime: daysAgo(2), severity: 'medium', description: 'Left classroom without permission.' },
  { id: 'inc-12', studentId: '3', teacherId: 't-1', dateTime: daysAgo(1), severity: 'low', description: 'Made progress on his focus today.' },
];
// NOTE: The `users` export is no longer needed as user data will come from Firestore.
// export const users: Record<string, User> = {
//   teacher: { id: 't-1', name: 'Sarah Wilson', email: 's.wilson@school.edu', role: 'teacher', avatarUrl: getImage('teacher-avatar') },
//   admin: { id: 'a-1', name: 'David Chen', email: 'd.chen@school.edu', role: 'admin', avatarUrl: getImage('admin-avatar') }
// };
