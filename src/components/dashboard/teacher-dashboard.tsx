'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentRoster } from '../student-roster';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import type { Student, User } from '@/lib/types';
import { doc } from 'firebase/firestore';

export function TeacherDashboard() {
  const { firestore, user } = useFirebase();

  const userRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData } = useDoc<User>(userRef);

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !userData?.classId) return null;
    // Correctly query the subcollection of students within a class
    return collection(firestore, 'classes', userData.classId, 'students');
  }, [firestore, userData?.classId]);

  const { data: students, isLoading } = useCollection<Student>(studentsQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">My Students</CardTitle>
        <CardDescription>
          An overview of the students in your class. Click on a student to view their behavior log.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading students...</div>}
        {students && <StudentRoster students={students} />}
        {!isLoading && !students?.length && <p>No students found for your class.</p>}
      </CardContent>
    </Card>
  );
}
