'use client';

import { useMemo } from 'react';
import { useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { AppHeader } from '@/components/app-header';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard';
import type { User as UserData } from '@/lib/types';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { isUserLoading, user, firestore } = useFirebase();

  const userRef = useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  if (isUserLoading || isUserDataLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <AppHeader title="Dashboard" />
        <div>Loading dashboard...</div>
      </main>
    );
  }

  if (!user) {
    return redirect('/login');
  }

  const role = userData?.role;
  const title = role === 'admin' ? 'Admin Dashboard' : 'Teacher Dashboard';

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <AppHeader title={title} />
      {role === 'admin' ? <AdminDashboard /> : <TeacherDashboard />}
    </main>
  );
}
