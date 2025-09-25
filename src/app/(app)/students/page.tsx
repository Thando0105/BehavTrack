'use client';

import { AppHeader } from '@/components/app-header';
import { StudentRoster } from '@/components/student-roster';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import type { User as UserData, Student } from '@/lib/types';
import { doc, collection, query } from 'firebase/firestore';
import { redirect } from 'next/navigation';

export default function StudentsPage() {
  const { user, isUserLoading, firestore } = useFirebase();

  const userRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  const studentsQuery = useMemoFirebase(
    () => {
      if (!firestore) return null;
      // In a real app, you might want to query based on class or school
      // For now, admins can see all students.
      return query(collection(firestore, 'students'));
    },
    [firestore]
  );
  const { data: students, isLoading: areStudentsLoading } = useCollection<Student>(studentsQuery);

  if (isUserLoading || isUserDataLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return redirect('/login');
  }

  if (userData?.role !== 'admin') {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <AppHeader title="Unauthorized" />
        <div className="flex flex-1 items-center justify-center">
          <p>You do not have permission to view this page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <AppHeader title="All Students" />
      <div className="grid gap-6">
        {areStudentsLoading ? (
          <p>Loading students...</p>
        ) : (
          <StudentRoster students={students || []} />
        )}
      </div>
    </main>
  );
}
