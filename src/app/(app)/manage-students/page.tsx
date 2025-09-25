'use client';

import { AppHeader } from '@/components/app-header';
import { AddStudentForm } from '@/components/manage-students/add-student-form';
import { StudentList } from '@/components/manage-students/student-list';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import type { User as UserData, Student } from '@/lib/types';
import { doc, collection, query, where } from 'firebase/firestore';
import { redirect } from 'next/navigation';

export default function ManageStudentsPage() {
  const { user, isUserLoading, firestore } = useFirebase();

  const userRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  const studentsQuery = useMemoFirebase(
    () => {
      if (firestore && userData?.role === 'admin') {
        return query(collection(firestore, 'students'));
      }
      return null;
    },
    [firestore, userData]
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
      <AppHeader title="Manage Students" />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <AddStudentForm />
        </div>
        <div className="lg:col-span-3">
          <StudentList students={students || []} isLoading={areStudentsLoading} />
        </div>
      </div>
    </main>
  );
}
