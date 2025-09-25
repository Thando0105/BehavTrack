'use client';

import { AppHeader } from '@/components/app-header';
import { AddTeacherForm } from '@/components/manage-teachers/add-teacher-form';
import { TeacherList } from '@/components/manage-teachers/teacher-list';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import type { User as UserData } from '@/lib/types';
import { doc, collection, query, where } from 'firebase/firestore';
import { redirect } from 'next/navigation';

export default function ManageTeachersPage() {
  const { user, isUserLoading, firestore } = useFirebase();

  const userRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  const teachersQuery = useMemoFirebase(
    () => query(collection(firestore, 'users'), where('role', '==', 'teacher')),
    [firestore]
  );
  const { data: teachers, isLoading: areTeachersLoading } = useCollection<UserData>(teachersQuery);

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
      <AppHeader title="Manage Teachers" />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <AddTeacherForm />
        </div>
        <div className="lg:col-span-3">
          <TeacherList teachers={teachers || []} isLoading={areTeachersLoading} />
        </div>
      </div>
    </main>
  );
}
