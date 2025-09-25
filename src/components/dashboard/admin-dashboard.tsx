import { Activity, AlertTriangle, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { incidents, students } from '@/lib/data';
import { IncidentCharts } from './incident-charts';

export function AdminDashboard() {
  const totalIncidents = incidents.length;
  const highSeverityIncidents = incidents.filter(i => i.severity === 'high').length;
  const totalStudents = students.length;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground">in the last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highSeverityIncidents}</div>
            <p className="text-xs text-muted-foreground">requiring immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Tracked</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">across all classes</p>
          </CardContent>
        </Card>
      </div>
      <IncidentCharts incidents={incidents} />
    </div>
  );
}
