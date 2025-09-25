import { notFound } from 'next/navigation';
import { incidents, students } from '@/lib/data';
import { StudentDetails } from '@/components/student-details';

export default async function StudentPage({ params }: { params: { id: string } }) {
  const student = students.find(s => s.id === params.id);
  
  if (!student) {
    notFound();
  }

  const studentIncidents = incidents
    .filter(i => i.studentId === student.id)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return <StudentDetails student={student} initialIncidents={studentIncidents} />;
}
