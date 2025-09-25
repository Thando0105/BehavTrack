'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentRoster } from '../student-roster';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import type { Student, User } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Button } from '../ui/button';
import { Upload } from 'lucide-react';
import { ImportDataDialog } from '../import-data-dialog';

export function TeacherDashboard() {
  const { firestore, user } = useFirebase();
  const [isImporting, setIsImporting] = useState(false);

  const userRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData } = useDoc<User>(userRef);

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !userData?.classId) return null;
    // Query the nested collection for the teacher's students
    return query(collection(firestore, 'students'), where('classId', '==', userData.classId));
  }, [firestore, userData?.classId]);

  const { data: students, isLoading } = useCollection<Student>(studentsQuery);

  return (
    <>
      <ImportDataDialog open={isImporting} onOpenChange={setIsImporting} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">My Students</CardTitle>
            <CardDescription>
              An overview of the students in your class. Click on a student to view their behavior log.
            </CardDescription>
          </div>
          <Button onClick={() => setIsImporting(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && <div>Loading students...</div>}
          {students && <StudentRoster students={students} />}
          {!isLoading && !students?.length && <p>No students found for your class.</p>}
        </CardContent>
      </Card>
    </>
  );
}
