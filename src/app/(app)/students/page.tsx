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
      // Only construct the query if firestore is ready and the user is confirmed to be an admin.
      if (firestore && userData?.role === 'admin') {
        return collection(firestore, 'students');
      }
      // For any other case (loading, not an admin, etc.), return null to prevent the query.
      return null;
    },
    [firestore, userData?.role] // Dependency is now on the role itself.
  );
  const { data: students, isLoading: areStudentsLoading } = useCollection<Student>(studentsQuery);

  if (isUserLoading || isUserDataLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return redirect('/login');
  }

  // This check is important as it prevents rendering anything further for non-admins.
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
