import { AppHeader } from '@/components/app-header';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard';
import type { UserRole } from '@/lib/types';
import { Suspense } from 'react';

function DashboardContent({ role }: { role: UserRole }) {
  return role === 'admin' ? <AdminDashboard /> : <TeacherDashboard />;
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { role?: UserRole };
}) {
  const role = searchParams.role || 'teacher';
  const title = role === 'admin' ? 'Admin Dashboard' : 'Teacher Dashboard';

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <AppHeader title={title} />
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <DashboardContent role={role} />
      </Suspense>
    </main>
  );
}
