'use client';

import { notFound, redirect } from 'next/navigation';
import { StudentDetails } from '@/components/student-details';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useMemo } from 'react';
import { doc, collection, query, where } from 'firebase/firestore';
import { useDoc, useCollection } from '@/firebase';
import type { Student, Incident, User as UserData } from '@/lib/types';


export default function StudentPage({ params }: { params: { id: string } }) {
  const { firestore, user, isUserLoading } = useFirebase();

  const userRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userRef);

  const studentRef = useMemoFirebase(() => {
    if (!firestore || !userData?.classId) return null;
    return doc(firestore, 'classes', userData.classId, 'students', params.id);
  }, [firestore, params.id, userData?.classId]);


  const incidentsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !userData) return null;

    if (userData.role === 'admin') {
      return query(collection(firestore, 'incidents'), where('studentId', '==', params.id));
    }
    
    if (userData.role === 'teacher') {
      return query(
        collection(firestore, 'incidents'),
        where('studentId', '==', params.id),
        where('teacherId', '==', user.uid)
      );
    }
    
    return null;
  }, [firestore, params.id, user, userData]);

  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentRef);
  const { data: incidents, isLoading: areIncidentsLoading } = useCollection<Incident>(incidentsQuery);

  if (isUserLoading || isStudentLoading || areIncidentsLoading || isUserDataLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return redirect('/login');
  }

  if (!student) {
    notFound();
  }

  const sortedIncidents = (incidents || []).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return <StudentDetails student={student} initialIncidents={sortedIncidents} />;
}
