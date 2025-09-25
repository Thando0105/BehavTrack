'use client';

import { notFound, redirect } from 'next/navigation';
import { StudentDetails } from '@/components/student-details';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase';
import type { Student, User as UserData } from '@/lib/types';


export default function StudentPage({ params }: { params: { id: string } }) {
  const { firestore, user, isUserLoading } = useFirebase();

  const userRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  const studentRef = useMemoFirebase(() => {
    if (!firestore) return null;
    // Admins and teachers both look up from the root students collection
    return doc(firestore, 'students', params.id);
  }, [firestore, params.id]);

  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentRef);

  if (isUserLoading || isStudentLoading || isUserDataLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return redirect('/login');
  }

  if (!student) {
    notFound();
  }

  // Security Check: If the user is a teacher, ensure they can only access students in their own class.
  if (userData?.role === 'teacher' && student.classId !== userData.classId) {
      return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">Access Denied</h3>
                <p className="text-sm text-muted-foreground">
                    You do not have permission to view this student's profile.
                </p>
                </div>
            </div>
        </main>
      )
  }


  return <StudentDetails student={student} />;
}
