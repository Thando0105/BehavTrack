'use client';

import { notFound, redirect } from 'next/navigation';
import { StudentDetails } from '@/components/student-details';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useMemo } from 'react';
import { doc, collection, query, where } from 'firebase/firestore';
import { useDoc, useCollection } from '@/firebase';
import type { Student, Incident } from '@/lib/types';


export default function StudentPage({ params }: { params: { id: string } }) {
  const { firestore, user, isUserLoading } = useFirebase();

  const studentRef = useMemoFirebase(() => {
    if (!firestore) return null;
    // This assumes students are in a top-level collection for simplicity
    // A better structure might be /classes/{classId}/students/{studentId}
    return doc(firestore, 'students', params.id);
  }, [firestore, params.id]);

  const incidentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'incidents'), where('studentId', '==', params.id));
  }, [firestore, params.id]);

  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentRef);
  const { data: incidents, isLoading: areIncidentsLoading } = useCollection<Incident>(incidentsQuery);

  if (isUserLoading || isStudentLoading || areIncidentsLoading) {
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
