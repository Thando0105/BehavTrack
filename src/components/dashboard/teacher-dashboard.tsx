'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentRoster } from '../student-roster';
import { useFirebase } from '@/firebase';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useDoc } from '@/firebase/firestore/use-doc';
import type { Student, User } from '@/lib/types';
import { doc } from 'firebase/firestore';

export function TeacherDashboard() {
  const { firestore, user } = useFirebase();

  const userRef = useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData } = useDoc<User>(userRef);

  const studentsQuery = useMemo(() => {
    if (!firestore || !userData?.classId) return null;
    return query(collection(firestore, 'students'), where('classId', '==', userData.classId));
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
        {!isLoading && !students && <p>No students found for your class.</p>}
      </CardContent>
    </Card>
  );
}
