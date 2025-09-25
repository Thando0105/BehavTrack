import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentRoster } from '../student-roster';
import { students } from '@/lib/data';

export function TeacherDashboard() {
  const teacherStudents = students.filter(s => s.classId === 'C101');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">My Students</CardTitle>
        <CardDescription>
          An overview of the students in your class. Click on a student to view their behavior log.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StudentRoster students={teacherStudents} />
      </CardContent>
    </Card>
  );
}
