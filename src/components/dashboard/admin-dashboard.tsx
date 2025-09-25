import { Activity, AlertTriangle, UserCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { IncidentCharts } from './incident-charts';
import { Button } from '../ui/button';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Incident as IncidentData, Student as StudentData } from '@/lib/types';
import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';

export function AdminDashboard() {
  const { firestore, user } = useFirebase();

  const userRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userData } = useDoc<User>(userRef);

  const incidentsQuery = useMemoFirebase(() => {
    if (!firestore || userData?.role !== 'admin') return null;
    return query(collection(firestore, 'incidents'));
  }, [firestore, userData]);
  const { data: incidents, isLoading: areIncidentsLoading } = useCollection<IncidentData>(incidentsQuery);

  const studentsQuery = useMemoFirebase(() => {
     if (!firestore || userData?.role !== 'admin') return null;
    return query(collection(firestore, 'students'));
  }, [firestore, userData]);
  const { data: students, isLoading: areStudentsLoading } = useCollection<StudentData>(studentsQuery);


  const totalIncidents = incidents?.length ?? 0;
  const highSeverityIncidents = incidents?.filter(i => i.severity === 'high').length ?? 0;
  const totalStudents = students?.length ?? 0;

  const isLoading = areIncidentsLoading || areStudentsLoading;


  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{totalIncidents}</div>}
            <p className="text-xs text-muted-foreground">in the last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{highSeverityIncidents}</div>}
            <p className="text-xs text-muted-foreground">requiring immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Tracked</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <div className="text-2xl font-bold">-</div> : <div className="text-2xl font-bold">{totalStudents}</div>}
            <p className="text-xs text-muted-foreground">across all classes</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teacher Management</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1">
             <CardDescription>Onboard new teachers and manage existing staff.</CardDescription>
          </CardContent>
          <CardFooter>
            <Button asChild className='w-full'>
              <Link href="/manage-teachers">Manage Teachers</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      <IncidentCharts incidents={incidents ?? []} />
    </div>
  );
}
